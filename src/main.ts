import { Loop } from "./core/Loop";
import { createGL } from "./render/createGL";

const INTERNAL_WIDTH = 320;
const INTERNAL_HEIGHT = 180;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const stats = document.getElementById("stats") as HTMLElement;
const gl = createGL(canvas);

// Upscale by a whole number so pixels stay crisp.
function fitCanvas(): void {
  const scale = Math.max(1, Math.floor(Math.min(innerWidth / INTERNAL_WIDTH, innerHeight / INTERNAL_HEIGHT)));
  canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
  canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
}
addEventListener("resize", fitCanvas);
fitCanvas();

// Simulation state: just a tick counter for now. Keep the previous value for interpolation.
let tick = 0;
let prevTick = 0;

// Counters for the on-screen readout.
let frames = 0;
let steps = 0;
let windowStart = performance.now();

const loop = new Loop({
  update() {
    prevTick = tick;
    tick++;
    steps++;
  },
  render(alpha) {
    // Blend between the last two simulation states.
    const t = (prevTick + (tick - prevTick) * alpha) / 60; // seconds of simulated time
    gl.clearColor(0.5 + 0.5 * Math.sin(t), 0.5 + 0.5 * Math.sin(t + 2.1), 0.5 + 0.5 * Math.sin(t + 4.2), 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    frames++;
    const now = performance.now();
    if (now - windowStart >= 1000) {
      const seconds = (now - windowStart) / 1000;
      stats.textContent = `frames/s ${(frames / seconds).toFixed(0)}   steps/s ${(steps / seconds).toFixed(0)}`;
      frames = 0;
      steps = 0;
      windowStart = now;
    }
  },
});

loop.start();
