import { Loop } from "./core/Loop";
import { createGL } from "./render/createGL";
import { RectRenderer } from "./render/RectRenderer";
import { SpriteBatch } from "./render/SpriteBatch";
import { createTexture } from "./render/texture";
import { makeTestPattern } from "./render/testPattern";

const INTERNAL_WIDTH = 320;
const INTERNAL_HEIGHT = 180;
const TILE = 16;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const stats = document.getElementById("stats") as HTMLElement;
const gl = createGL(canvas);
const rects = new RectRenderer(gl, INTERNAL_WIDTH, INTERNAL_HEIGHT);
const batch = new SpriteBatch(gl, INTERNAL_WIDTH, INTERNAL_HEIGHT);
const pattern = createTexture(gl, TILE, TILE, makeTestPattern(TILE));

// ?quads=N draws N extra small quads, to watch batching and flushing.
const extraQuads = Number(new URLSearchParams(location.search).get("quads") ?? 0) || 0;

// Upscale by a whole number so pixels stay crisp.
function fitCanvas(): void {
  const scale = Math.max(1, Math.floor(Math.min(innerWidth / INTERNAL_WIDTH, innerHeight / INTERNAL_HEIGHT)));
  canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
  canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
}
addEventListener("resize", fitCanvas);
fitCanvas();

// Simulation state: a box sliding across the screen. Keep the previous x for interpolation.
const BOX_SIZE = 48;
const BOX_SPEED = 80; // pixels per second
let boxX = 0;
let prevBoxX = 0;

// Counters for the on-screen readout.
let frames = 0;
let steps = 0;
let windowStart = performance.now();
let lastQuads = 0;
let lastDrawCalls = 0;

const loop = new Loop({
  update(stepMs) {
    prevBoxX = boxX;
    boxX += (BOX_SPEED * stepMs) / 1000;
    if (boxX > INTERNAL_WIDTH) boxX = -BOX_SIZE; // wrap around
    // After a wrap, don't interpolate across the whole screen.
    if (boxX < prevBoxX) prevBoxX = boxX;
    steps++;
  },
  render(alpha) {
    gl.clearColor(0.08, 0.09, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Corner markers verify the pixel -> clip space conversion (including the y flip).
    rects.drawRect(0, 0, 16, 16, [1, 0.2, 0.2, 1]); // top-left: red
    rects.drawRect(INTERNAL_WIDTH - 16, INTERNAL_HEIGHT - 16, 16, 16, [0.2, 0.6, 1, 1]); // bottom-right: blue

    batch.resetStats();
    batch.begin(pattern);

    // Two rows of ground tiles along the bottom.
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < INTERNAL_WIDTH / TILE; col++) {
        batch.draw(col * TILE, INTERNAL_HEIGHT - TILE * (2 - row), TILE, TILE);
      }
    }

    // Optional stress: many small quads scattered deterministically.
    for (let i = 0; i < extraQuads; i++) {
      const x = (i * 37) % (INTERNAL_WIDTH - 4);
      const y = (i * 91) % (INTERNAL_HEIGHT - 4);
      batch.draw(x, y, 4, 4);
    }

    // The moving box, drawn between its last two simulated positions.
    const x = prevBoxX + (boxX - prevBoxX) * alpha;
    batch.draw(x, 40, BOX_SIZE, BOX_SIZE);

    batch.end();
    lastQuads = batch.stats.quads;
    lastDrawCalls = batch.stats.drawCalls;

    frames++;
    const now = performance.now();
    if (now - windowStart >= 1000) {
      const seconds = (now - windowStart) / 1000;
      stats.textContent =
        `frames/s ${(frames / seconds).toFixed(0)}   steps/s ${(steps / seconds).toFixed(0)}\n` +
        `quads ${lastQuads}   draw calls ${lastDrawCalls}`;
      frames = 0;
      steps = 0;
      windowStart = now;
    }
  },
});

loop.start();
