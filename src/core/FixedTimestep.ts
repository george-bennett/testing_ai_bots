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

  private accumulator: number = 0

  advance(_frameMs: number): number {
    const safeTime = Math.min(frameMs, this.maxFrameTime);
    this.accumulator += safeTime;

    const stepsToRun = Math.floor(this.accumulator / this.targetTimeStep);

    this.accumulator -= stepsToRun * this.targetTimeStep;

    return stepsToRun
  }
 public getAlpha(): number {
    return this.accumulator / this.targetTimeStep;
  }
}
