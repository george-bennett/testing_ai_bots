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
export function cameraFor(_target: Vec2, _view: Size, _world: Size): Vec2 {
  throw new Error("TODO: implement cameraFor");
}
