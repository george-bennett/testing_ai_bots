/**
 * Pure packing logic for the sprite batcher: no GL, so it can be unit tested in Node.
 *
 * Vertex layout (interleaved): x, y, u, v  -> 4 floats per vertex.
 * Vertex order within a quad is clockwise from the top-left:
 *   0 = top-left, 1 = top-right, 2 = bottom-right, 3 = bottom-left.
 * See src/render/quadBatch.test.ts for the spec.
 */

export const FLOATS_PER_VERTEX = 4;
export const VERTICES_PER_QUAD = 4;
export const INDICES_PER_QUAD = 6;
export const FLOATS_PER_QUAD = FLOATS_PER_VERTEX * VERTICES_PER_QUAD;

/**
 * Write one quad's 4 vertices into `vertices`, as quad number `quadIndex`.
 * (x, y, w, h) is the rectangle in pixels; (u0, v0) is the texture coordinate
 * of its top-left corner and (u1, v1) that of its bottom-right corner.
 */
export function writeQuad(
  _vertices: Float32Array,
  _quadIndex: number,
  _x: number,
  _y: number,
  _w: number,
  _h: number,
  _u0: number,
  _v0: number,
  _u1: number,
  _v1: number,
): void {
  throw new Error("TODO: implement writeQuad");
}

/**
 * Fill `indices` with the index pattern for `quadCount` quads (6 indices each).
 * Indices count vertices, not floats.
 */
export function fillQuadIndices(indices: Uint16Array, quadCount: number): void {
for (let quad = 0; quad < quadCount; quad++) {
  const firstIndex = quad * 6 ;   // where this quad's 6 indices start in `indices`
  const firstVertex = quad * 4 ;  // the "4i" from your formula
  indices[firstIndex + 0] = firstVertex + 0;
  indices[firstIndex + 1] = firstVertex + 1;
  indices[firstIndex + 2] = firstVertex + 2;
  indices[firstIndex + 3] = firstVertex + 2;
  indices[firstIndex + 4] = firstVertex + 3;
  indices[firstIndex + 5] = firstVertex + 0;// ...five more lines, using your pattern: 0, 1, 2, 2, 3, 0
}
}
