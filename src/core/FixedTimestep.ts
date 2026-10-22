/**
 * Decides how many fixed-size simulation steps to run for a given real frame time.
 *
 * Pure logic: no browser APIs, so it can be unit tested in Node.
 * See docs/DESIGN.md (timestep) and src/core/FixedTimestep.test.ts for the spec.
 */
export class FixedTimestep {
  constructor(
    /** Length of one simulation step, in milliseconds. */
    readonly stepMs: number = 1000 / 60,
    /** Longest frame we will accept, in milliseconds. Longer frames are clamped. */
    readonly maxFrameMs: number = 250,
  ) {}

  /**
   * Feed in how much real time passed since the last frame (ms).
   * Returns how many simulation steps to run this frame.
   */
  advance(_frameMs: number): number {
    throw new Error("TODO: implement FixedTimestep.advance");
  }

  /**
   * Fraction of a step left over after the last advance(), in [0, 1).
   * The renderer uses it to interpolate between the previous and current state.
   */
  get alpha(): number {
    throw new Error("TODO: implement FixedTimestep.alpha");
  }
}
