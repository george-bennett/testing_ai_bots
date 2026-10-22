import { describe, expect, it } from "vitest";
import { makeTestPattern } from "./testPattern";

function pixel(data: Uint8Array, size: number, x: number, y: number): number[] {
  const i = (y * size + x) * 4;
  return Array.from(data.slice(i, i + 4));
}

describe("makeTestPattern", () => {
  const size = 16;
  const data = makeTestPattern(size);

  it("has RGBA data for every pixel", () => {
    expect(data.length).toBe(size * size * 4);
  });

  it("marks three corners differently, and leaves bottom-right unmarked", () => {
    const tl = pixel(data, size, 0, 0);
    const tr = pixel(data, size, size - 1, 0);
    const bl = pixel(data, size, 0, size - 1);
    const br = pixel(data, size, size - 1, size - 1);
    const all = [tl, tr, bl, br].map((p) => p.join());
    expect(new Set(all).size).toBe(4);
    expect(tl[0]).toBeGreaterThan(tl[1]!); // red-ish
    expect(tr[1]).toBeGreaterThan(tr[0]!); // green-ish
    expect(bl[2]).toBeGreaterThan(bl[0]!); // blue-ish
  });

  it("draws stripes along '/': pixels with the same x+y share a colour", () => {
    expect(pixel(data, size, 6, 6)).toEqual(pixel(data, size, 7, 5));
    expect(pixel(data, size, 6, 6)).toEqual(pixel(data, size, 5, 7));
  });

  it("is fully opaque", () => {
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255);
  });
});
