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
  return (row*column) + column
}
