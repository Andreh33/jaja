import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crtCameraFrames, crtProjection } from '../src/components/effects/crt-projection';

describe('CRT camera projection', () => {
  it('maps all four viewport corners exactly into a tilted screen', () => {
    const target = [{ x: 800, y: 200 }, { x: 1400, y: 80 }, { x: 1470, y: 780 }, { x: 850, y: 740 }];
    const result = crtProjection(1600, 900, target);
    assert.ok(result);
    const m = result.slice(9, -1).split(',').map(Number);
    const source = [[0, 0], [1600, 0], [1600, 900], [0, 900]];
    source.forEach(([x, y], i) => {
      const w = m[3] * x + m[7] * y + m[15];
      assert.ok(Math.abs((m[0] * x + m[4] * y + m[12]) / w - target[i].x) < .00001);
      assert.ok(Math.abs((m[1] * x + m[5] * y + m[13]) / w - target[i].y) < .00001);
    });
  });

  it('supports a flat screen when the hero has reduced motion', () => {
    const matrix = crtProjection(100, 100, [{x:10,y:20},{x:60,y:20},{x:60,y:70},{x:10,y:70}]);
    assert.equal(matrix, 'matrix3d(0.5,0,0,0,0,0.5,0,0,0,0,1,0,10,20,0,1)');
  });

  it('rejects absent, invalid or collapsed geometry for an immediate safe exit', () => {
    assert.equal(crtProjection(0, 900, []), null);
    assert.equal(crtProjection(1600, 900, [{x:NaN,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]), null);
    assert.equal(crtProjection(1600, 900, Array.from({length:4},()=>({x:0,y:0}))), null);
  });

  it('uses a continuous geometric path and dissolves only after reaching the glass', () => {
    const frames = crtCameraFrames(100,100,[{x:50,y:0},{x:100,y:0},{x:100,y:50},{x:50,y:50}]);
    assert.ok(frames);
    assert.equal(frames.length,26);
    assert.equal(frames[0].transform,'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)');
    assert.equal(frames[12].transform,'matrix3d(0.75,0,0,0,0,0.75,0,0,0,0,1,0,25,0,0,1)');
    assert.equal(frames[24].transform,frames[25].transform);
    assert.equal(frames[24].opacity,1);
    assert.equal(frames[25].opacity,0);
  });
});
