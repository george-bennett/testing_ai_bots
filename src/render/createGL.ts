/** Get a WebGL2 context for the canvas, or fail loudly. */
export function createGL(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 is not supported in this browser");
  return gl;
}
