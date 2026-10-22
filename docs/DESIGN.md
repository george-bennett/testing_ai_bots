# Engine Design (v0.1 draft)

A small, readable 2D platformer engine. TypeScript + WebGL2, runs in the browser.
Goal: learn how engines and renderers work, then ship a playable Mario-style game.

## Principles

- **Simple over general.** A feature exists only if the target game needs it.
- **No editor in v1.** Data lives in plain files (maps authored in Tiled, exported as JSON).
- **Readable over clever.** One class per game object. No ECS.
- **Every milestone is visible.** Each step ends with something running on screen.

## Non-goals (v1)

Audio, UI toolkit, particles, scripting language, physics engine, networking,
mobile/console targets, Sonic-style slope physics, HD-2D rendering.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Target game | Mario-style tile platformer | Axis-aligned tile collision is tractable; Sonic physics deferred |
| Language | TypeScript | Familiar from JS; types help while learning |
| Graphics | WebGL2 (not Canvas 2D) | Learning goal: buffers, shaders, batching |
| Build | Vite (dev server + bundling) | Minimal config |
| Architecture | Class per game object | Simplest for a game this size |
| Timestep | Fixed 1/60 s simulation, decoupled rendering | Behaviour must not depend on display refresh rate |
| Maps | Tiled JSON | Avoids writing an editor |

## Modules

```
src/
  core/      game loop (fixed timestep), input, asset loading
  render/    GL context, shaders, sprite batcher, texture atlas, camera
  world/     tilemap loading + rendering, collision queries
  game/      player, enemies, pickups (uses the engine; not part of it)
```

The engine (`core`, `render`, `world`) must not import from `game`.

## Milestones

1. **Window + loop.** Canvas, WebGL2 context, fixed-timestep loop, clear to a colour. *(done)*
2. **Quad.** Shader + vertex buffer, draw one coloured rectangle. *(done)*
3. **Sprite.** Textures, draw an image, then a sprite batcher (many quads, one draw call). *(done)*
4. **Animation + camera.** Atlas frames, a camera that follows a target. *(camera done; animation next)*
5. **Tilemap.** Load a Tiled map and draw it.
6. **Collision.** Player AABB vs. tiles, resolved per axis.
7. **Platformer feel.** Acceleration, variable jump height, coyote time, jump buffering.
8. **Game.** Enemies, pickups, a couple of levels.

## Decided

- **Art:** basic geometry (coloured rectangles) only. The focus is on logic.
- **Resolution:** low internal resolution, upscaled with crisp pixels. Modern/native scaling comes later with the fancy renderer.
- **Input:** keyboard only in v1.
- **Testing:** unit tests (Vitest) for pure logic such as the timestep and collision. Pure logic is kept free of browser APIs so it can be tested in Node.

## Rendering conventions

- Pixel coordinates, origin top-left, y down. The vertex shader converts to clip space.
- World -> screen is `world - camera`, done in the vertex shader via a uniform.
- The camera is rounded to whole pixels at render time only; simulation positions stay exact.
- Quad vertex order is clockwise from the top-left; indices are `0,1,2,2,3,0` per quad.
- Animation is driven by simulation steps, not real frame time.
- A full sprite batch flushes (one extra draw call) rather than dropping or throwing.

## Open questions

- Exact internal resolution (e.g. 320x180, 16:9) and tile size (e.g. 16 px).
- Screenshot checks for rendering: worth it, or manual only?

## Who writes what

Learning-critical pieces are written by the author, reviewed by Claude:
the fixed-timestep loop and tile collision resolution.
Claude drafts the rest, and the author reads and questions it.
