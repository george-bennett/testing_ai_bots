import { describe, expect, it } from "vitest";
import { cameraFor } from "./camera";

const view = { w: 320, h: 180 };
const world = { w: 1000, h: 600 };

describe("cameraFor", () => {
  it("centres the view on a target in the middle of the world", () => {
    // target (500, 300): the view's top-left is half a view up and left of it
    expect(cameraFor({ x: 500, y: 300 }, view, world)).toEqual({ x: 340, y: 210 });
  });

  it("stops at the left and top edges", () => {
    expect(cameraFor({ x: 10, y: 5 }, view, world)).toEqual({ x: 0, y: 0 });
  });

  it("stops at the right and bottom edges", () => {
    // furthest the camera may go is world size minus view size
    expect(cameraFor({ x: 990, y: 595 }, view, world)).toEqual({ x: 680, y: 420 });
  });

  it("treats each axis independently", () => {
    // near the left edge horizontally, but free to move vertically
    expect(cameraFor({ x: 10, y: 300 }, view, world)).toEqual({ x: 0, y: 210 });
  });

  it("is exactly at the edge when the view just touches it", () => {
    expect(cameraFor({ x: 160, y: 90 }, view, world)).toEqual({ x: 0, y: 0 });
    expect(cameraFor({ x: 840, y: 510 }, view, world)).toEqual({ x: 680, y: 420 });
  });

  it("stays at 0 on an axis where the world is smaller than the view", () => {
    const small = { w: 200, h: 600 };
    expect(cameraFor({ x: 100, y: 300 }, view, small)).toEqual({ x: 0, y: 210 });
  });
});
