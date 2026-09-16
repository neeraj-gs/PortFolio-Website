/*===============================================================
   SCENE MATH
   Pure depth-easing for the scroll scene engine (see main.js
   sceneFrame). No DOM access, so it runs the same in the browser
   and under `node --test` — exposed as window.SceneMath, or via
   module.exports when required from Node.
===============================================================*/
(function (root) {
  'use strict';

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // Given a section's viewport-relative rect (top/bottom/height, as from
  // getBoundingClientRect()) and the viewport height, compute the depth
  // transform for that frame: entering sections rise out of depth tilting
  // upright (cubic ease-out), leaving sections lift toward the camera and
  // dissolve (quadratic ease-in) — the two blend where a section is both
  // still settling in and already starting to leave.
  function sceneEase(top, bottom, height, vh) {
    // Far outside the viewport: caller should settle once, then skip.
    if (top > vh * 1.4 || bottom < -vh * 0.4) return { skip: true };

    var ein = clamp((vh - top) / (vh * 0.85), 0, 1);
    var e = 1 - Math.pow(1 - ein, 3);

    var eout = clamp((vh * 0.45 - bottom) / (vh * 0.45), 0, 1);
    var o = eout * eout;

    return {
      skip: false,
      ty: (1 - e) * 90 - o * 70,
      rx: (1 - e) * 7,
      sc: 0.955 + 0.045 * e + o * 0.03,
      op: Math.min(0.25 + 0.75 * e, 1 - o * 0.6),
      // Drives the ghost numeral's parallax.
      p: clamp((vh - top) / (vh + height), 0, 1)
    };
  }

  var api = { clamp: clamp, sceneEase: sceneEase };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SceneMath = api;
})(typeof window !== 'undefined' ? window : this);
