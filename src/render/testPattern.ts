export type Rgba = readonly [r: number, g: number, b: number, a: number];

const STRIPE: Rgba = [200, 210, 230, 255];
const GAP: Rgba = [40, 45, 70, 255];
const RED: Rgba = [255, 60, 60, 255];
const GREEN: Rgba = [60, 255, 100, 255];
const BLUE: Rgba = [60, 120, 255, 255];

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
