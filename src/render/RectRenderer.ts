import { createProgram } from "./program";
import { RECT_FRAGMENT_SHADER, RECT_VERTEX_SHADER } from "./shaders";

export type Color = readonly [r: number, g: number, b: number, a: number];

/**
 * Draws solid rectangles in pixel coordinates (origin top-left, y down).
 * Each rect is 4 vertices + 6 indices (two triangles sharing the diagonal).
 * One draw call per rect for now; the sprite batcher in milestone 3 replaces this.
 */
export class RectRenderer {
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly vertexBuffer: WebGLBuffer;
  private readonly canvasSizeLocation: WebGLUniformLocation | null;
  private readonly colorLocation: WebGLUniformLocation | null;
  private readonly corners = new Float32Array(8);

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly width: number,
    private readonly height: number,
  ) {
    this.program = createProgram(gl, RECT_VERTEX_SHADER, RECT_FRAGMENT_SHADER);
    this.canvasSizeLocation = gl.getUniformLocation(this.program, "u_canvas_size");
    this.colorLocation = gl.getUniformLocation(this.program, "u_color");
    const positionLocation = gl.getAttribLocation(this.program, "a_pixel_position");

    const vao = gl.createVertexArray();
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    if (!vao || !vertexBuffer || !indexBuffer) throw new Error("Could not allocate GL buffers");
    this.vao = vao;
    this.vertexBuffer = vertexBuffer;

    gl.bindVertexArray(vao);

    // Vertex buffer: 4 corners (x, y), rewritten on each draw.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.corners.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Index buffer: corners are 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 1, 3]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  drawRect(x: number, y: number, w: number, h: number, color: Color): void {
    const { gl, corners } = this;
    corners.set([x, y, x + w, y, x, y + h, x + w, y + h]);

    gl.useProgram(this.program);
    gl.uniform2f(this.canvasSizeLocation, this.width, this.height);
    gl.uniform4f(this.colorLocation, color[0], color[1], color[2], color[3]);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, corners);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
