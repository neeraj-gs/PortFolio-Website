// Run with: node --test tests/
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sceneEase } = require('../assets/js/scene-math.js');

function close(actual, expected, msg) {
  assert.ok(
    Math.abs(actual - expected) < 1e-3,
    `${msg}: expected ${expected}, got ${actual}`
  );
}

test('a section far below the viewport is skipped', () => {
  const m = sceneEase(2000, 2800, 800, 1000);
  assert.equal(m.skip, true);
});

test('a section far above the viewport (scrolled past) is skipped', () => {
  const m = sceneEase(-2000, -1500, 500, 1000);
  assert.equal(m.skip, true);
});

test('a section filling the viewport is fully settled: centered, upright, opaque', () => {
  const m = sceneEase(0, 1000, 1000, 1000);
  assert.equal(m.skip, false);
  close(m.ty, 0, 'ty');
  close(m.rx, 0, 'rx');
  close(m.sc, 1.0, 'sc');
  close(m.op, 1, 'op');
});

test('a section just crossing the bottom edge is barely entered: pushed back, tilted, faint', () => {
  // top === vh means it has not risen out of depth at all yet.
  const m = sceneEase(1000, 1800, 800, 1000);
  assert.equal(m.skip, false);
  close(m.ty, 90, 'ty');
  close(m.rx, 7, 'rx');
  close(m.sc, 0.955, 'sc');
  close(m.op, 0.25, 'op');
});

test('a section leaving past the top blends dissolve into the settled pose', () => {
  // Fully entered (top << vh) but bottom is well past the leave threshold
  // (vh * 0.45), so it should be mid-dissolve rather than fully opaque.
  // eout = (450 - 200) / 450 = 0.5556, o = eout^2 = 0.30864
  const m = sceneEase(-500, 200, 700, 1000);
  assert.equal(m.skip, false);
  close(m.ty, -21.605, 'ty');
  close(m.op, 0.814815, 'op');
  close(m.sc, 1.009259, 'sc');
  close(m.rx, 0, 'rx (fully entered, so tilt should be flat)');
});

test('opacity and scale never leave their sane 0-1-ish ranges across a full scroll sweep', () => {
  const vh = 1000;
  const height = 600;
  for (let top = -2000; top <= 2000; top += 25) {
    const m = sceneEase(top, top + height, height, vh);
    if (m.skip) continue;
    assert.ok(m.op >= 0 && m.op <= 1, `op out of range at top=${top}: ${m.op}`);
    assert.ok(m.sc > 0.9 && m.sc < 1.1, `sc out of range at top=${top}: ${m.sc}`);
  }
});
