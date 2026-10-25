export type Rgba = readonly [r: number, g: number, b: number, a: number];

const STRIPE: Rgba = [200, 210, 230, 255];
const GAP: Rgba = [40, 45, 70, 255];
const RED: Rgba = [255, 60, 60, 255];
const GREEN: Rgba = [60, 255, 100, 255];
const BLUE: Rgba = [60, 120, 255, 255];

const YELLOW: Rgba = [255, 220, 60, 255];
const CELL_COLOURS: readonly Rgba[] = [RED, GREEN, BLUE, YELLOW];
const BLOCK = 6;
const MARGIN = 2;

/**
 * Generate a horizontal strip of `cells` square animation cells, each `size` pixels wide.
 * Cell i has a coloured block in a different corner, moving clockwise: top-left, top-right,
 * bottom-right, bottom-left. Played in order it looks like a marker circling the cell.
 * Returns RGBA data for a (cells * size) x size texture. Row 0 is the TOP row.
 */
export function makeAtlasPattern(cells = 4, size = 16): Uint8Array {
  const width = cells * size;
  const data = new Uint8Array(width * size * 4);
  const near = MARGIN;
  const far = size - MARGIN - BLOCK;
  const corners = [
    [near, near],
    [far, near],
    [far, far],
    [near, far],
  ] as const;

  for (let cell = 0; cell < cells; cell++) {
    const [blockX, blockY] = corners[cell % corners.length]!;
    const colour = CELL_COLOURS[cell % CELL_COLOURS.length]!;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const inBlock = x >= blockX && x < blockX + BLOCK && y >= blockY && y < blockY + BLOCK;
        const onBorder = x === 0 || y === 0 || x === size - 1 || y === size - 1;
        const pixel = inBlock ? colour : onBorder ? STRIPE : GAP;
        data.set(pixel, (y * width + cell * size + x) * 4);
      }
    }
  }
  return data;
}

/**
 * Generate a square RGBA test texture without needing an image file.
 * "/" diagonal stripes, plus three coloured corner markers so any flip or rotation is obvious:
 * top-left red, top-right green, bottom-left blue, bottom-right unmarked.
 * Row 0 of the data is the TOP row of the image.
 */
export function makeTestPattern(size = 16, marker = 3): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const left = x < marker;
      const right = x >= size - marker;
      const top = y < marker;
      const bottom = y >= size - marker;

      let colour: Rgba = (x + y) % 8 < 4 ? STRIPE : GAP; // constant x+y runs along "/"
      if (left && top) colour = RED;
      else if (right && top) colour = GREEN;
      else if (left && bottom) colour = BLUE;

      data.set(colour, (y * size + x) * 4);
    }
  }
  return data;
}
