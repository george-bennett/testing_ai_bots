import { describe, expect, it } from "vitest";
import { type Animation, atlasRegion, frameAt } from "./animation";

describe("atlasRegion", () => {
  it("maps cell 0 to the top-left cell", () => {
    expect(atlasRegion(0, 4, 2)).toEqual({ u0: 0, v0: 0, u1: 0.25, v1: 0.5 });
  });

  it("numbers cells along the top row first", () => {
    expect(atlasRegion(3, 4, 2)).toEqual({ u0: 0.75, v0: 0, u1: 1, v1: 0.5 });
  });

  it("continues on the next row", () => {
    expect(atlasRegion(5, 4, 2)).toEqual({ u0: 0.25, v0: 0.5, u1: 0.5, v1: 1 });
  });
});

describe("frameAt", () => {
  // Atlas cell 7 for 4 steps, cell 8 for 2 steps, cell 9 for 6 steps: 12 steps in total.
  const walk: Animation = {
    loop: true,
    frames: [
      { frame: 7, steps: 4 },
      { frame: 8, steps: 2 },
      { frame: 9, steps: 6 },
    ],
  };

  it("starts on the first frame", () => {
    expect(frameAt(walk, 0)).toBe(7);
  });

  it("holds each frame for exactly its own number of steps", () => {
    expect(frameAt(walk, 3)).toBe(7); // last step of the first frame
    expect(frameAt(walk, 4)).toBe(8); // first step of the second
    expect(frameAt(walk, 5)).toBe(8);
    expect(frameAt(walk, 6)).toBe(9);
    expect(frameAt(walk, 11)).toBe(9); // last step of the last frame
  });

  it("wraps back to the first frame when looping", () => {
    expect(frameAt(walk, 12)).toBe(7);
    expect(frameAt(walk, 16)).toBe(8);
    expect(frameAt(walk, 12 * 50 + 6)).toBe(9);
  });

  it("holds the last frame when not looping", () => {
    const once: Animation = { ...walk, loop: false };
    expect(frameAt(once, 11)).toBe(9);
    expect(frameAt(once, 12)).toBe(9);
    expect(frameAt(once, 1000)).toBe(9);
  });

  it("throws on an animation with no frames, whether or not it loops", () => {
    expect(() => frameAt({ loop: true, frames: [] }, 0)).toThrow();
    expect(() => frameAt({ loop: false, frames: [] }, 0)).toThrow();
  });

  it("works for a single-frame animation", () => {
    const still: Animation = { loop: true, frames: [{ frame: 3, steps: 10 }] };
    expect(frameAt(still, 0)).toBe(3);
    expect(frameAt(still, 25)).toBe(3);
  });
});
