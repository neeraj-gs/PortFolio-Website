/*===============================================================
   THE ORCHESTRATION FIELD
   A 3D agent graph rendered behind the whole page.

   Nodes are agents, clustered into teams around hub agents.
   Edges are handoffs. Packets of light travelling the edges are
   work moving through the system — the literal shape of what
   this portfolio is about, not decorative particles.

   Exposes window.Field: { setTheme, setScroll, destroy }
===============================================================*/
(function () {
  'use strict';

  var canvas = document.getElementById('field');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*---------- topology ----------*/
  var narrow = window.innerWidth < 768;
  var CLUSTERS = narrow ? 4 : 7;
  var NODES = narrow ? 44 : 84;
  var PACKETS = narrow ? 14 : 36;

  var SPAN_X = 58, SPAN_Y = 32, SPAN_Z = 30;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
  camera.position.set(0, 0, 78);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    return; // no WebGL — the CSS atmosphere layer carries the page
  }
  renderer.setClearColor(0x000000, 0);

  var group = new THREE.Group();
  scene.add(group);

  /*---------- build the graph ----------*/
  function gaussian() {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  }

  var hubs = [];
  for (var c = 0; c < CLUSTERS; c++) {
    var a = (c / CLUSTERS) * Math.PI * 2 + Math.random() * 0.5;
    hubs.push({
      x: Math.cos(a) * SPAN_X * 0.62 + gaussian() * 8,
      y: Math.sin(a) * SPAN_Y * 0.66 + gaussian() * 6,
      z: gaussian() * SPAN_Z
    });
  }

  var nodes = [];
  var hubIndex = [];

  // One hub per cluster first, so hub indices are stable and known.
  for (var h = 0; h < CLUSTERS; h++) {
    hubIndex.push(nodes.length);
    nodes.push({ x: hubs[h].x, y: hubs[h].y, z: hubs[h].z, cluster: h, hub: true });
  }

  for (var i = nodes.length; i < NODES; i++) {
    var cl = i % CLUSTERS;
    nodes.push({
      x: hubs[cl].x + gaussian() * 13,
      y: hubs[cl].y + gaussian() * 9,
      z: hubs[cl].z + gaussian() * 12,
      cluster: cl,
      hub: false
    });
  }

  // Edges: spokes to the cluster hub, a sibling link, and hub-to-hub trunks.
  var edges = [];
  var seen = {};
  function addEdge(a, b, trunk) {
    if (a === b) return;
    var key = a < b ? a + ':' + b : b + ':' + a;
    if (seen[key]) return;
    seen[key] = 1;
    edges.push({ a: a, b: b, trunk: !!trunk });
  }

  for (var n = 0; n < nodes.length; n++) {
    if (nodes[n].hub) continue;
    addEdge(n, hubIndex[nodes[n].cluster], false);

    // nearest sibling inside the same cluster
    var best = -1, bestD = Infinity;
    for (var m = 0; m < nodes.length; m++) {
      if (m === n || nodes[m].cluster !== nodes[n].cluster || nodes[m].hub) continue;
      var dx = nodes[m].x - nodes[n].x, dy = nodes[m].y - nodes[n].y, dz = nodes[m].z - nodes[n].z;
      var d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) { bestD = d; best = m; }
    }
    if (best >= 0) addEdge(n, best, false);
  }

  for (var t = 0; t < hubIndex.length; t++) {
    addEdge(hubIndex[t], hubIndex[(t + 1) % hubIndex.length], true);
    if (t % 2 === 0) addEdge(hubIndex[t], hubIndex[(t + 3) % hubIndex.length], true);
  }

  /*---------- palettes ----------*/
  var PALETTE = {
    dark: {
      node: new THREE.Color(0x8f9bc4),
      hub: new THREE.Color(0xff7a45),
      packet: new THREE.Color(0x4fd8c4),
      line: new THREE.Color(0x5a6890),
      trunk: new THREE.Color(0xff7a45),
      lineOpacity: 0.34,
      blending: THREE.AdditiveBlending
    },
    light: {
      node: new THREE.Color(0x54607e),
      hub: new THREE.Color(0xd9531e),
      packet: new THREE.Color(0x0d8f7c),
      line: new THREE.Color(0x8994b0),
      trunk: new THREE.Color(0xd9531e),
      lineOpacity: 0.5,
      blending: THREE.NormalBlending
    }
  };

  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  var pal = isLight ? PALETTE.light : PALETTE.dark;

  /*---------- nodes ----------*/
  var nodePos = new Float32Array(nodes.length * 3);
  var nodeSize = new Float32Array(nodes.length);
  var nodeSeed = new Float32Array(nodes.length);
  var nodeRole = new Float32Array(nodes.length);

  for (var k = 0; k < nodes.length; k++) {
    nodePos[k * 3] = nodes[k].x;
    nodePos[k * 3 + 1] = nodes[k].y;
    nodePos[k * 3 + 2] = nodes[k].z;
    nodeSize[k] = nodes[k].hub ? 7.5 : 3.2 + Math.random() * 1.8;
    nodeSeed[k] = Math.random();
    nodeRole[k] = nodes[k].hub ? 1 : 0;
  }

  var nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(nodeSize, 1));
  nodeGeo.setAttribute('aSeed', new THREE.BufferAttribute(nodeSeed, 1));
  nodeGeo.setAttribute('aRole', new THREE.BufferAttribute(nodeRole, 1));

  var POINT_VERT = [
    'attribute float aSize;',
    'attribute float aSeed;',
    'attribute float aRole;',
    'uniform float uTime;',
    'uniform float uDpr;',
    'uniform vec3 uFocus;',
    'varying float vAlpha;',
    'varying float vRole;',
    'void main() {',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  float pulse = 0.68 + 0.32 * sin(uTime * 1.3 + aSeed * 6.2831);',
    '  float prox = 1.0 - smoothstep(0.0, 30.0, distance(position, uFocus));',
    '  gl_PointSize = aSize * (1.0 + prox * 1.5) * pulse * uDpr * (300.0 / max(-mv.z, 1.0));',
    '  gl_Position = projectionMatrix * mv;',
    '  float depth = clamp(1.0 - (-mv.z - 42.0) / 90.0, 0.05, 1.0);',
    '  vAlpha = depth * (0.45 + 0.55 * pulse) + prox * 0.55;',
    '  vRole = aRole;',
    '}'
  ].join('\n');

  var POINT_FRAG = [
    'uniform vec3 uColorA;',
    'uniform vec3 uColorB;',
    'varying float vAlpha;',
    'varying float vRole;',
    'void main() {',
    '  vec2 c = gl_PointCoord - 0.5;',
    '  float d = length(c);',
    '  if (d > 0.5) discard;',
    '  float core = smoothstep(0.5, 0.0, d);',
    '  vec3 col = mix(uColorA, uColorB, vRole);',
    '  gl_FragColor = vec4(col, pow(core, 2.2) * clamp(vAlpha, 0.0, 1.0));',
    '}'
  ].join('\n');

  function pointMaterial(colorA, colorB) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: 1 },
        uFocus: { value: new THREE.Vector3(0, 0, 200) },
        uColorA: { value: colorA.clone() },
        uColorB: { value: colorB.clone() }
      },
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: pal.blending
    });
  }

  var nodeMat = pointMaterial(pal.node, pal.hub);
  var nodePoints = new THREE.Points(nodeGeo, nodeMat);
  group.add(nodePoints);

  /*---------- edges ----------*/
  var edgePos = new Float32Array(edges.length * 6);
  var edgeCol = new Float32Array(edges.length * 6);

  function writeEdgeColors() {
    for (var e = 0; e < edges.length; e++) {
      var col = edges[e].trunk ? pal.trunk : pal.line;
      for (var v = 0; v < 2; v++) {
        var o = e * 6 + v * 3;
        edgeCol[o] = col.r;
        edgeCol[o + 1] = col.g;
        edgeCol[o + 2] = col.b;
      }
    }
  }

  for (var e2 = 0; e2 < edges.length; e2++) {
    var na = nodes[edges[e2].a], nb = nodes[edges[e2].b];
    edgePos[e2 * 6] = na.x; edgePos[e2 * 6 + 1] = na.y; edgePos[e2 * 6 + 2] = na.z;
    edgePos[e2 * 6 + 3] = nb.x; edgePos[e2 * 6 + 4] = nb.y; edgePos[e2 * 6 + 5] = nb.z;
  }
  writeEdgeColors();

  var edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
  edgeGeo.setAttribute('aColor', new THREE.BufferAttribute(edgeCol, 3));

  var edgeMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: pal.lineOpacity } },
    vertexShader: [
      'attribute vec3 aColor;',
      'varying vec3 vColor;',
      'varying float vFade;',
      'void main() {',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  vFade = clamp(1.0 - (-mv.z - 40.0) / 95.0, 0.0, 1.0);',
      '  vColor = aColor;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'varying vec3 vColor;',
      'varying float vFade;',
      'void main() { gl_FragColor = vec4(vColor, vFade * uOpacity); }'
    ].join('\n'),
    transparent: true,
    depthWrite: false,
    blending: pal.blending
  });

  group.add(new THREE.LineSegments(edgeGeo, edgeMat));

  /*---------- packets: work moving between agents ----------*/
  var packets = [];
  var packetPos = new Float32Array(PACKETS * 3);
  var packetSize = new Float32Array(PACKETS);
  var packetSeed = new Float32Array(PACKETS);
  var packetRole = new Float32Array(PACKETS);

  function assignPacket(p) {
    p.edge = (Math.random() * edges.length) | 0;
    p.t = 0;
    p.speed = 0.12 + Math.random() * 0.3;
    p.dir = Math.random() < 0.5 ? 1 : -1;
  }

  for (var p2 = 0; p2 < PACKETS; p2++) {
    var pk = {};
    assignPacket(pk);
    pk.t = Math.random();
    packets.push(pk);
    packetSize[p2] = 4.6 + Math.random() * 2.2;
    packetSeed[p2] = Math.random();
    packetRole[p2] = 0;
  }

  var packetGeo = new THREE.BufferGeometry();
  packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
  packetGeo.setAttribute('aSize', new THREE.BufferAttribute(packetSize, 1));
  packetGeo.setAttribute('aSeed', new THREE.BufferAttribute(packetSeed, 1));
  packetGeo.setAttribute('aRole', new THREE.BufferAttribute(packetRole, 1));

  var packetMat = pointMaterial(pal.packet, pal.packet);
  group.add(new THREE.Points(packetGeo, packetMat));

  function stepPackets(dt) {
    for (var i = 0; i < packets.length; i++) {
      var p = packets[i];
      p.t += p.speed * dt;
      if (p.t >= 1) assignPacket(p);

      var ed = edges[p.edge];
      var a = nodes[ed.a], b = nodes[ed.b];
      var u = p.dir > 0 ? p.t : 1 - p.t;
      packetPos[i * 3] = a.x + (b.x - a.x) * u;
      packetPos[i * 3 + 1] = a.y + (b.y - a.y) * u;
      packetPos[i * 3 + 2] = a.z + (b.z - a.z) * u;
    }
    packetGeo.attributes.position.needsUpdate = true;
  }

  /*---------- responsive sizing ----------*/
  var dpr = 1;
  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    // Pull back on narrow viewports so the graph still fills the frame
    camera.position.z = w < 900 ? 104 : 78;
    camera.updateProjectionMatrix();

    nodeMat.uniforms.uDpr.value = dpr;
    packetMat.uniforms.uDpr.value = dpr;
  }
  resize();

  /*---------- interaction ----------*/
  var pointer = { x: 0, y: 0 };
  var target = { rx: 0, ry: 0 };
  var current = { rx: 0, ry: 0 };
  var focus = new THREE.Vector3(0, 0, 200);
  var scrollP = 0;

  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', function (ev) {
      pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (ev.clientY / window.innerHeight) * 2 - 1;
      target.ry = pointer.x * 0.16;
      target.rx = pointer.y * 0.1;
      // A probe in graph space so nodes light up near the cursor
      focus.set(pointer.x * SPAN_X, -pointer.y * SPAN_Y, 6);
    }, { passive: true });
  }

  /*---------- loop ----------*/
  var clock = new THREE.Clock();
  var running = true;
  var frame = null;

  function render() {
    var dt = Math.min(clock.getDelta(), 0.05);
    var time = clock.getElapsedTime();

    current.rx += (target.rx - current.rx) * 0.045;
    current.ry += (target.ry - current.ry) * 0.045;

    group.rotation.x = current.rx;
    group.rotation.y = current.ry + time * 0.018;

    // Scroll drives the field downward and back, so the page reads as
    // one continuous space rather than a hero-only effect.
    group.position.y = scrollP * 26;
    group.position.z = -scrollP * 30;

    nodeMat.uniforms.uTime.value = time;
    packetMat.uniforms.uTime.value = time;
    nodeMat.uniforms.uFocus.value.copy(focus);

    stepPackets(dt);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    render();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    clock.getDelta();
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduceMotion) render();
    }, 150);
  }, { passive: true });

  /*---------- public API ----------*/
  window.Field = {
    setTheme: function (light) {
      pal = light ? PALETTE.light : PALETTE.dark;

      nodeMat.uniforms.uColorA.value.copy(pal.node);
      nodeMat.uniforms.uColorB.value.copy(pal.hub);
      packetMat.uniforms.uColorA.value.copy(pal.packet);
      packetMat.uniforms.uColorB.value.copy(pal.packet);
      edgeMat.uniforms.uOpacity.value = pal.lineOpacity;

      // Additive blending washes out on a light ground — swap to normal.
      nodeMat.blending = packetMat.blending = edgeMat.blending = pal.blending;
      nodeMat.needsUpdate = packetMat.needsUpdate = edgeMat.needsUpdate = true;

      writeEdgeColors();
      edgeGeo.attributes.aColor.needsUpdate = true;

      if (reduceMotion) render();
    },

    setScroll: function (p) {
      scrollP = p;
    }
  };

  /*---------- go ----------*/
  if (reduceMotion) {
    running = false;
    render();
    canvas.classList.add('ready');
  } else {
    running = false;
    start();
    requestAnimationFrame(function () { canvas.classList.add('ready'); });
  }
})();
