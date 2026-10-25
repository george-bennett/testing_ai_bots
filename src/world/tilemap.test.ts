import { describe, expect, it } from "vitest";
import { getTileCoordinate, tileIndex } from "./tilemap";

describe("getTileCoordinate", () => {
  it("finds the tile a pixel falls in", () => {
    expect(getTileCoordinate(37, 0)).toEqual({ column: 2, row: 0 });
    expect(getTileCoordinate(0, 0)).toEqual({ column: 0, row: 0 });
  });

  it("starts a new tile exactly on the boundary", () => {
    expect(getTileCoordinate(15, 15)).toEqual({ column: 0, row: 0 });
    expect(getTileCoordinate(16, 16)).toEqual({ column: 1, row: 1 });
  });

  it("ignores the fractional part of a pixel", () => {
    expect(getTileCoordinate(31.9, 47.9)).toEqual({ column: 1, row: 2 });
  });

  it("puts pixels left of or above the map in negative tiles (floor, not truncate)", () => {
    expect(getTileCoordinate(-1, -1)).toEqual({ column: -1, row: -1 });
    expect(getTileCoordinate(-16, -17)).toEqual({ column: -1, row: -2 });
  });

  it("supports other tile sizes", () => {
    expect(getTileCoordinate(17, 9, 8)).toEqual({ column: 2, row: 1 });
  });
});

describe("tileIndex", () => {
  it("is the position in a flat list, row after row", () => {
    expect(tileIndex(0, 0, 20)).toBe(0);
    expect(tileIndex(19, 0, 20)).toBe(19); // last tile of the first row
    expect(tileIndex(0, 1, 20)).toBe(20); // first tile of the second row
    expect(tileIndex(3, 2, 20)).toBe(43);
    expect(tileIndex(19, 11, 20)).toBe(239); // last tile of a 20 x 12 map
  });

  it("depends on the map's width", () => {
    expect(tileIndex(3, 2, 10)).toBe(23);
  });
});
