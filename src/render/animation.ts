/**
 * Animation timing and atlas lookup. Pure logic: no GL, so it can be unit tested in Node.
 * Animations advance in simulation steps, never in real frame time.
 * See src/render/animation.test.ts for the spec.
 */

/** One animation frame: which atlas cell to show, and for how many simulation steps. */
export interface AnimationFrame {
  frame: number;
  steps: number;
}

export interface Animation {
  frames: readonly AnimationFrame[];
  /** true: wrap back to the first frame after the last. false: hold the last frame. */
  loop: boolean;
}

export interface Region {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

/**
 * Texture coordinates of cell `frame` in a grid atlas of `columns` x `rows` equal cells.
 * Cells are numbered row by row from the top-left: 0, 1, 2 ... along the top row, then the next row.
 */
export function atlasRegion(frame: number, columns: number, rows: number): Region {
  const column = frame % columns;
  const row = Math.floor(frame / columns);
  return {
    u0: column / columns,
    v0: row / rows,
    u1: (column + 1) / columns,
    v1: (row + 1) / rows,
  };
}

/**
 * Which atlas frame the animation shows after `elapsedSteps` simulation steps.
 * Each entry is shown for its own `steps`. Past the end, a looping animation wraps
 * and a non-looping one holds its last frame.
 */
export function frameAt(animation: Animation, elapsedSteps: number): number {
  const last = animation.frames[animation.frames.length - 1];
  if (last === undefined) throw new Error("Animation loop not defined, defaulting to base animation");

  let total = 0;
  for (const entry of animation.frames) {
    total += entry.steps;
  }

  let remaining = animation.loop ? (elapsedSteps % total) : elapsedSteps;   // loop: wrap into one cycle
  for (const entry of animation.frames) {
    if (remaining < entry.steps) return entry.frame;
    remaining -= entry.steps;
  }
  return animation.frames;   // ran past the end (only possible when not looping): hold the last frame
}
