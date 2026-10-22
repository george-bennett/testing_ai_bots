import { FixedTimestep } from "./FixedTimestep";

export interface LoopCallbacks {
  /** Advance the simulation by exactly one fixed step. */
  update(stepMs: number): void;
  /** Draw the current state. `alpha` in [0, 1) is how far we are between the last two steps. */
  render(alpha: number): void;
}

/**
 * Wires requestAnimationFrame to FixedTimestep.
 * Each browser frame: run 0..n simulation steps, then render once.
 */
export class Loop {
  private readonly timestep = new FixedTimestep();
  private lastTime: number | null = null;
  private rafId = 0;

  constructor(private readonly callbacks: LoopCallbacks) {}

  start(): void {
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    cancelAnimationFrame(this.rafId);
  }

  private readonly frame = (now: number): void => {
    // First frame (or first after a hidden tab): no previous time, so no elapsed time.
    const frameMs = this.lastTime === null ? 0 : now - this.lastTime;
    this.lastTime = now;

    const steps = this.timestep.advance(frameMs);
    for (let i = 0; i < steps; i++) this.callbacks.update(this.timestep.stepMs);
    this.callbacks.render(this.timestep.alpha);

    this.rafId = requestAnimationFrame(this.frame);
  };

  // Forget the old timestamp so returning to the tab doesn't look like one huge frame.
  private readonly onVisibilityChange = (): void => {
    this.lastTime = null;
  };
}
