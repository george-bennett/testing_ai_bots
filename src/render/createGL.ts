/** Get a WebGL2 context for the canvas, or fail loudly. */
export function createGL(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  // antialias off: pixel art must not blend edges that land between pixels.
  const gl = canvas.getContext("webgl2", { antialias: false });
  if (!gl) throw new Error("WebGL2 is not supported in this browser");
  return gl;
}
