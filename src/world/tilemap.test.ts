import { describe, expect, it } from "vitest";
import { type TiledMapJson, type TileMap, getTileCoordinate, parseTiledMap, tileAt, tileIndex } from "./tilemap";

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

describe("parseTiledMap", () => {
  const valid: TiledMapJson = {
    width: 3,
    height: 2,
    tilewidth: 16,
    tileheight: 16,
    layers: [{ type: "tilelayer", data: [0, 1, 2, 3, 0, 1] }],
  };

  it("reads size, tile size and tile ids", () => {
    expect(parseTiledMap(valid)).toEqual({
      columns: 3,
      rows: 2,
      tileSize: 16,
      tiles: [0, 1, 2, 3, 0, 1],
    });
  });

  it("uses the first tile layer and skips other layer types", () => {
    const map = parseTiledMap({
      ...valid,
      layers: [{ type: "objectgroup" }, { type: "tilelayer", data: [1, 1, 1, 1, 1, 1] }],
    });
    expect(map.tiles).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it("strips Tiled's flip flags from tile ids", () => {
    const flipped = 0x80000000 + 5; // tile 5, flipped horizontally
    const map = parseTiledMap({ ...valid, layers: [{ type: "tilelayer", data: [flipped, 0, 0, 0, 0, 0] }] });
    expect(map.tiles[0]).toBe(5);
  });

  it("throws when there is no tile layer", () => {
    expect(() => parseTiledMap({ ...valid, layers: [{ type: "objectgroup" }] })).toThrow(/no tile layer/);
  });

  it("throws when the data length does not match width x height", () => {
    expect(() => parseTiledMap({ ...valid, layers: [{ type: "tilelayer", data: [1, 2, 3] }] })).toThrow(/expected 6/);
  });

  it("throws on non-square tiles", () => {
    expect(() => parseTiledMap({ ...valid, tileheight: 8 })).toThrow(/square/);
  });
});

describe("tileAt", () => {
  // 3 wide, 2 high:  1 2 3
  //                  4 5 6
  const map: TileMap = { columns: 3, rows: 2, tileSize: 16, tiles: [1, 2, 3, 4, 5, 6] };

  it("returns the tile id at a column and row", () => {
    expect(tileAt(map, 0, 0)).toBe(1);
    expect(tileAt(map, 2, 0)).toBe(3);
    expect(tileAt(map, 0, 1)).toBe(4);
    expect(tileAt(map, 2, 1)).toBe(6);
  });
});
