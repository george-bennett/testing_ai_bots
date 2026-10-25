/**
 * Tile grid lookup math. Pure arithmetic: no GL, so it can be unit tested in Node.
 * A map is stored as one flat list, row after row from the top-left.
 * See src/world/tilemap.test.ts for the spec.
 */

export interface GridCoordinate {
  column: number;
  row: number;
}

// Calculate pixel position within column
export function getTileCoordinate(pixelX: number, pixelY: number, tileSize: number = 16): GridCoordinate {
  return {
    // Math.floor() mirrors the integer division (//) behavior
    column: Math.floor(pixelX / tileSize),
    row: Math.floor(pixelY / tileSize)
  };
}

/**
 * Position in the flat tile list of the tile at (column, row), for a map `columns` tiles wide.
 * Row 0 occupies positions 0 .. columns-1, row 1 starts right after it, and so on.
 */
export function tileIndex(column: number, row: number, columns: number): number {
  return (row*columns) + column
}

/** A level: a grid of tile ids, stored flat (see tileIndex). 0 means empty. */
export interface TileMap {
  columns: number;
  rows: number;
  tileSize: number;
  tiles: readonly number[];
}

/** The part of Tiled's JSON export format that we read. */
export interface TiledMapJson {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: readonly { type: string; data?: readonly number[] }[];
}

// Tiled stores flip/rotate flags in the top bits of each tile id; we don't support them, so we strip them.
const TILE_ID_MASK = 0x1fffffff;

/**
 * Read the first tile layer of a Tiled map export. Fails loudly on anything we don't support,
 * so a bad level file shows up the moment it is loaded.
 */
export function parseTiledMap(json: TiledMapJson): TileMap {
  if (json.tilewidth !== json.tileheight) {
    throw new Error(`parseTiledMap: tiles must be square, got ${json.tilewidth}x${json.tileheight}`);
  }
  const layer = json.layers.find((l) => l.type === "tilelayer");
  if (!layer || !layer.data) throw new Error("parseTiledMap: map has no tile layer");

  const expected = json.width * json.height;
  if (layer.data.length !== expected) {
    throw new Error(`parseTiledMap: expected ${expected} tiles (${json.width}x${json.height}), got ${layer.data.length}`);
  }

  return {
    columns: json.width,
    rows: json.height,
    tileSize: json.tilewidth,
    tiles: layer.data.map((id) => id & TILE_ID_MASK),
  };
}

/**
 * The tile id at (column, row), or whatever you decide for positions outside the map.
 * Used for drawing and, in milestone 6, for collision.
 */
export function tileAt(_map: TileMap, _column: number, _row: number): number {
  throw new Error("TODO: implement tileAt");
}
