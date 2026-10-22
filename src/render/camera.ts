/**
 * Camera follow logic. Pure arithmetic: no GL, so it can be unit tested in Node.
 * See src/render/camera.test.ts for the spec.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

/**
 * Where the camera's top-left corner should be so that `target` is centred in the view,
 * without the view ever showing anything outside the world.
 * If the world is smaller than the view on an axis, the camera sits at 0 on that axis.
 * Each axis is independent.
 */
function axis(target: number, view: number, world: number): number {
  const centred = target - view / 2;   // step 1: target minus half the view (assembled from "300 - 90")
  const max = Math.max(0, world - view);       // furthest the camera's edge may go
  return Math.min(Math.max(centred, 0), max);
}

export function cameraFor(target: Vec2, view: Size, world: Size): Vec2 {
  return {
    x: axis(target.x, view.w, world.w),
    y: axis(target.y, view.h, world.h),
  };
}
