/**
 * Upload RGBA pixel data (row 0 = top of the image) as a texture.
 * Nearest-neighbour sampling keeps pixel art crisp; clamping avoids bleeding at the edges.
 */
export function createTexture(gl: WebGL2RenderingContext, width: number, height: number, rgba: Uint8Array): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Could not create texture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}
