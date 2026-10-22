import { describe, expect, it } from "vitest";
import {
  FLOATS_PER_QUAD,
  FLOATS_PER_VERTEX,
  INDICES_PER_QUAD,
  fillQuadIndices,
  writeQuad,
} from "./quadBatch";

describe("writeQuad", () => {
  it("writes top-left, top-right, bottom-right, bottom-left as x, y, u, v", () => {
    const v = new Float32Array(FLOATS_PER_QUAD);
    writeQuad(v, 0, 10, 20, 30, 40, 0, 0, 1, 1);
    expect(Array.from(v)).toEqual([
      10, 20, 0, 0, // top-left
      40, 20, 1, 0, // top-right
      40, 60, 1, 1, // bottom-right
      10, 60, 0, 1, // bottom-left
    ]);
  });

  it("maps a sub-rectangle of the texture (atlas frame) onto the quad", () => {
    const v = new Float32Array(FLOATS_PER_QUAD);
    writeQuad(v, 0, 0, 0, 16, 16, 0.25, 0.5, 0.5, 0.75);
    expect(Array.from(v.slice(2, 4))).toEqual([0.25, 0.5]); // top-left uv
    expect(Array.from(v.slice(10, 12))).toEqual([0.5, 0.75]); // bottom-right uv
  });

  it("writes quad n at float offset 16n and leaves its neighbours untouched", () => {
    const v = new Float32Array(FLOATS_PER_QUAD * 3).fill(-1);
    writeQuad(v, 1, 5, 6, 7, 8, 0, 0, 1, 1);
    expect(v.slice(0, FLOATS_PER_QUAD).every((n) => n === -1)).toBe(true);
    expect(v.slice(2 * FLOATS_PER_QUAD).every((n) => n === -1)).toBe(true);
    expect(Array.from(v.slice(FLOATS_PER_QUAD, FLOATS_PER_QUAD + FLOATS_PER_VERTEX))).toEqual([5, 6, 0, 0]);
  });
});

describe("fillQuadIndices", () => {
  it("uses 4n-based indices, 6 per quad", () => {
    const idx = new Uint16Array(INDICES_PER_QUAD * 2);
    fillQuadIndices(idx, 2);
    expect(Array.from(idx)).toEqual([0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4]);
  });

  it("splits each quad along a diagonal, not an edge", () => {
    // Build a real quad, then look at the geometry the indices actually describe.
    const w = 30;
    const h = 40;
    const v = new Float32Array(FLOATS_PER_QUAD);
    writeQuad(v, 0, 0, 0, w, h, 0, 0, 1, 1);
    const idx = new Uint16Array(INDICES_PER_QUAD);
    fillQuadIndices(idx, 1);

    const triangleA = new Set([idx[0], idx[1], idx[2]]);
    const triangleB = [idx[3], idx[4], idx[5]];
    const shared = triangleB.filter((i) => triangleA.has(i));
    expect(shared).toHaveLength(2); // two triangles share exactly one line

    const [i, j] = shared as [number, number];
    const dx = v[i * FLOATS_PER_VERTEX]! - v[j * FLOATS_PER_VERTEX]!;
    const dy = v[i * FLOATS_PER_VERTEX + 1]! - v[j * FLOATS_PER_VERTEX + 1]!;
    expect(Math.hypot(dx, dy)).toBeCloseTo(Math.hypot(w, h), 5); // that line is a diagonal
  });
});
