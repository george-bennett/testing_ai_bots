import { describe, expect, it } from "vitest";
import { makeAtlasPattern, makeTestPattern } from "./testPattern";

describe("makeAtlasPattern", () => {
  const cells = 4;
  const size = 16;
  const data = makeAtlasPattern(cells, size);
  const width = cells * size;
  const at = (cell: number, x: number, y: number) => {
    const i = (y * width + cell * size + x) * 4;
    return Array.from(data.slice(i, i + 4));
  };

  it("has RGBA data for a (cells * size) x size texture", () => {
    expect(data.length).toBe(width * size * 4);
  });

  it("puts the coloured block in a different corner of each cell, clockwise from top-left", () => {
    const centres = [
      [5, 5], // cell 0: top-left
      [10, 5], // cell 1: top-right
      [10, 10], // cell 2: bottom-right
      [5, 10], // cell 3: bottom-left
    ] as const;
    const colours = centres.map(([x, y], cell) => at(cell, x, y).join());
    expect(new Set(colours).size).toBe(4); // four different colours

    // and each corner is empty (background) in the other three cells
    centres.forEach(([x, y], owner) => {
      for (let cell = 0; cell < cells; cell++) {
        if (cell !== owner) expect(at(cell, x, y)).not.toEqual(at(owner, x, y));
      }
    });
  });

  it("is fully opaque", () => {
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255);
  });
});

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
