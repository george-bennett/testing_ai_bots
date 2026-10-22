import { describe, expect, it } from "vitest";
import { FixedTimestep } from "./FixedTimestep";

const STEP = 1000 / 60;

/** Simulate `seconds` of wall-clock time at a given display refresh rate. */
function runAt(hz: number, seconds = 1) {
  const ts = new FixedTimestep();
  const perFrame: number[] = [];
  for (let i = 0; i < hz * seconds; i++) perFrame.push(ts.advance(1000 / hz));
  return { ts, perFrame, total: perFrame.reduce((a, b) => a + b, 0) };
}

describe("FixedTimestep", () => {
  it("runs one step per frame at 60 Hz", () => {
    const { perFrame } = runAt(60);
    expect(perFrame.every((n) => n === 1)).toBe(true);
  });

  it("runs about 60 steps per second at 144 Hz, mostly 0 or 1 per frame", () => {
    const { perFrame, total } = runAt(144);
    expect(total).toBeGreaterThanOrEqual(59);
    expect(total).toBeLessThanOrEqual(60);
    expect(Math.max(...perFrame)).toBe(1);
    expect(perFrame.filter((n) => n === 0).length).toBeGreaterThan(0);
  });

  it("runs two steps per frame at 30 Hz", () => {
    const { perFrame } = runAt(30);
    expect(perFrame.every((n) => n === 2)).toBe(true);
  });

  it("carries leftover time between frames", () => {
    const ts = new FixedTimestep();
    expect(ts.advance(STEP / 2)).toBe(0);
    expect(ts.advance(STEP / 2)).toBe(1);
  });

  it("clamps a huge frame (e.g. returning to a hidden tab)", () => {
    const ts = new FixedTimestep();
    const steps = ts.advance(10_000);
    expect(steps).toBeLessThanOrEqual(Math.ceil(250 / STEP));
    expect(steps).toBeGreaterThan(0);
  });

  it("reports alpha as the leftover fraction of a step", () => {
    const ts = new FixedTimestep();
    ts.advance(STEP * 1.5);
    expect(ts.alpha).toBeCloseTo(0.5, 5);
  });

  it("keeps alpha within [0, 1) across many irregular frames", () => {
    const ts = new FixedTimestep();
    for (const frame of [3, 7, 16.7, 40, 1, 12, 100, 0.5, 22]) {
      ts.advance(frame);
      expect(ts.alpha).toBeGreaterThanOrEqual(0);
      expect(ts.alpha).toBeLessThan(1);
    }
  });
});
