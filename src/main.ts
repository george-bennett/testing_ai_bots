import { Loop } from "./core/Loop";
import { type Animation, atlasRegion, frameAt } from "./render/animation";
import { cameraFor } from "./render/camera";
import { createGL } from "./render/createGL";
import { RectRenderer } from "./render/RectRenderer";
import { SpriteBatch } from "./render/SpriteBatch";
import { createTexture } from "./render/texture";
import { makeAtlasPattern, makeTestPattern } from "./render/testPattern";

const INTERNAL_WIDTH = 320;
const INTERNAL_HEIGHT = 180;
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 180;
const TILE = 16;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const stats = document.getElementById("stats") as HTMLElement;
const gl = createGL(canvas);
const rects = new RectRenderer(gl, INTERNAL_WIDTH, INTERNAL_HEIGHT);
const batch = new SpriteBatch(gl, INTERNAL_WIDTH, INTERNAL_HEIGHT);
const pattern = createTexture(gl, TILE, TILE, makeTestPattern(TILE));

// Animation atlas: a strip of 4 cells, each TILE x TILE.
const ATLAS_CELLS = 4;
const atlas = createTexture(gl, ATLAS_CELLS * TILE, TILE, makeAtlasPattern(ATLAS_CELLS, TILE));

// Frame 0 is held longer than the others (12 steps vs 8), to show per-frame timing.
const walk: Animation = {
  loop: true,
  frames: [
    { frame: 0, steps: 12 },
    { frame: 1, steps: 8 },
    { frame: 2, steps: 8 },
    { frame: 3, steps: 8 },
  ],
};

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

// Simulation state: a box sliding across the world. Keep the previous x for interpolation.
const BOX_SIZE = 48;
const BOX_Y = 40;
const BOX_SPEED = 80; // pixels per second
let boxX = 0;
let prevBoxX = 0;
let animSteps = 0; // simulation steps elapsed, which drives the animation

// Counters for the on-screen readout.
let frames = 0;
let steps = 0;
let windowStart = performance.now();
let lastQuads = 0;
let lastDrawCalls = 0;

const view = { w: INTERNAL_WIDTH, h: INTERNAL_HEIGHT };
const world = { w: WORLD_WIDTH, h: WORLD_HEIGHT };

const loop = new Loop({
  update(stepMs) {
    prevBoxX = boxX;
    boxX += (BOX_SPEED * stepMs) / 1000;
    if (boxX > WORLD_WIDTH) boxX = -BOX_SIZE; // wrap around
    // After a wrap, don't interpolate across the whole world.
    if (boxX < prevBoxX) prevBoxX = boxX;
    animSteps++;
    steps++;
  },
  render(alpha) {
    gl.clearColor(0.08, 0.09, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // The box, drawn between its last two simulated positions.
    const x = prevBoxX + (boxX - prevBoxX) * alpha;

    // The camera follows the box's centre; rounded so everything snaps to whole pixels.
    const camera = cameraFor({ x: x + BOX_SIZE / 2, y: BOX_Y + BOX_SIZE / 2 }, view, world);
    batch.setCamera(Math.round(camera.x), Math.round(camera.y));

    // Screen-space corner markers (the rect renderer has no camera).
    rects.drawRect(0, 0, 16, 16, [1, 0.2, 0.2, 1]); // top-left: red
    rects.drawRect(INTERNAL_WIDTH - 16, INTERNAL_HEIGHT - 16, 16, 16, [0.2, 0.6, 1, 1]); // bottom-right: blue

    batch.resetStats();
    batch.begin(pattern);

    // Two rows of ground tiles along the whole world.
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < WORLD_WIDTH / TILE; col++) {
        batch.draw(col * TILE, INTERNAL_HEIGHT - TILE * (2 - row), TILE, TILE);
      }
    }

    // Optional stress: many small quads scattered deterministically.
    for (let i = 0; i < extraQuads; i++) {
      const sx = (i * 37) % (WORLD_WIDTH - 4);
      const sy = (i * 91) % (INTERNAL_HEIGHT - 4);
      batch.draw(sx, sy, 4, 4);
    }

    batch.end();

    // The box uses a different texture (the atlas), so it gets its own batch: a texture change means a new draw call.
    const frame = frameAt(walk, animSteps);
    const region = atlasRegion(frame, ATLAS_CELLS, 1);
    batch.begin(atlas);
    batch.draw(x, BOX_Y, BOX_SIZE, BOX_SIZE, region.u0, region.v0, region.u1, region.v1);
    batch.end();
    lastQuads = batch.stats.quads;
    lastDrawCalls = batch.stats.drawCalls;

    frames++;
    const now = performance.now();
    if (now - windowStart >= 1000) {
      const seconds = (now - windowStart) / 1000;
      stats.textContent =
        `frames/s ${(frames / seconds).toFixed(0)}   steps/s ${(steps / seconds).toFixed(0)}\n` +
        `quads ${lastQuads}   draw calls ${lastDrawCalls}\n` +
        `box x ${boxX.toFixed(0)}   camera x ${Math.round(camera.x)}   anim frame ${frame}`;
      frames = 0;
      steps = 0;
      windowStart = now;
    }
  },
});

loop.start();
