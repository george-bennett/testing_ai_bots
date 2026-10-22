import { createProgram } from "./program";
import {
  FLOATS_PER_QUAD,
  FLOATS_PER_VERTEX,
  INDICES_PER_QUAD,
  VERTICES_PER_QUAD,
  fillQuadIndices,
  writeQuad,
} from "./quadBatch";
import { SPRITE_FRAGMENT_SHADER, SPRITE_VERTEX_SHADER } from "./shaders";

const BYTES_PER_FLOAT = 4;
const STRIDE = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;

/**
 * Collects textured quads on the CPU and draws them with as few draw calls as possible.
 * Usage per frame: begin(texture) -> draw(...) many times -> end().
 * When the buffer fills up it flushes (one draw call) and keeps going.
 */
export class SpriteBatch {
  /** Counters for the last begin..end span(s); read and reset with resetStats(). */
  readonly stats = { quads: 0, drawCalls: 0 };

  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly vertexBuffer: WebGLBuffer;
  private readonly vertices: Float32Array;
  private readonly canvasSizeLocation: WebGLUniformLocation | null;
  private readonly textureLocation: WebGLUniformLocation | null;
  private readonly cameraLocation: WebGLUniformLocation | null;
  private cameraX = 0;
  private cameraY = 0;
  private count = 0;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly width: number,
    private readonly height: number,
    private readonly maxQuads = 4096,
  ) {
    if (maxQuads * VERTICES_PER_QUAD > 65536) throw new Error("maxQuads too large for 16-bit indices");
    this.vertices = new Float32Array(maxQuads * FLOATS_PER_QUAD);

    this.program = createProgram(gl, SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER);
    this.canvasSizeLocation = gl.getUniformLocation(this.program, "u_canvas_size");
    this.textureLocation = gl.getUniformLocation(this.program, "u_texture");
    this.cameraLocation = gl.getUniformLocation(this.program, "u_camera");
    const positionLocation = gl.getAttribLocation(this.program, "a_pixel_position");
    const uvLocation = gl.getAttribLocation(this.program, "a_uv");

    const vao = gl.createVertexArray();
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    if (!vao || !vertexBuffer || !indexBuffer) throw new Error("Could not allocate GL buffers");
    this.vao = vao;
    this.vertexBuffer = vertexBuffer;

    gl.bindVertexArray(vao);

    // Vertex buffer: interleaved x, y, u, v. Sized once, refilled every frame.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, STRIDE, 2 * BYTES_PER_FLOAT);

    // Index buffer: identical pattern for every quad, built once.
    const indices = new Uint16Array(maxQuads * INDICES_PER_QUAD);
    fillQuadIndices(indices, maxQuads);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  /** Set the camera's world position (top-left of the view) for subsequent begin() calls. */
  setCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  begin(texture: WebGLTexture): void {
    const { gl } = this;
    gl.useProgram(this.program);
    gl.uniform2f(this.canvasSizeLocation, this.width, this.height);
    gl.uniform2f(this.cameraLocation, this.cameraX, this.cameraY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.textureLocation, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.count = 0;
  }

  /** Queue one quad. (x, y, w, h) in pixels; (u0, v0)-(u1, v1) is the texture region. */
  draw(x: number, y: number, w: number, h: number, u0 = 0, v0 = 0, u1 = 1, v1 = 1): void {
    if (this.count === this.maxQuads) this.flush();
    writeQuad(this.vertices, this.count, x, y, w, h, u0, v0, u1, v1);
    this.count++;
    this.stats.quads++;
  }

  end(): void {
    this.flush();
  }

  resetStats(): void {
    this.stats.quads = 0;
    this.stats.drawCalls = 0;
  }

  private flush(): void {
    if (this.count === 0) return;
    const { gl } = this;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    // Upload only the part of the buffer actually used this batch.
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices, 0, this.count * FLOATS_PER_QUAD);
    gl.drawElements(gl.TRIANGLES, this.count * INDICES_PER_QUAD, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    this.stats.drawCalls++;
    this.count = 0;
  }
}
