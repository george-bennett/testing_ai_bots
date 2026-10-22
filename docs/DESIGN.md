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

1. **Window + loop.** Canvas, WebGL2 context, fixed-timestep loop, clear to a colour.
2. **Quad.** Shader + vertex buffer, draw one coloured rectangle.
3. **Sprite.** Textures, draw an image, then a sprite batcher (many quads, one draw call).
4. **Animation + camera.** Atlas frames, a camera that follows a target.
5. **Tilemap.** Load a Tiled map and draw it.
6. **Collision.** Player AABB vs. tiles, resolved per axis.
7. **Platformer feel.** Acceleration, variable jump height, coyote time, jump buffering.
8. **Game.** Enemies, pickups, a couple of levels.

## Open questions

- Art: draw our own placeholder, or use a free CC0 tileset (e.g. Kenney)?
- Pixel-perfect scaling: render at a low internal resolution and upscale, or render natively?
- Gamepad support in v1, or keyboard only?
- Testing: unit tests for pure logic (collision, timestep); screenshot checks for rendering?

## Who writes what

Learning-critical pieces are written by the author, reviewed by Claude:
the fixed-timestep loop and tile collision resolution.
Claude drafts the rest, and the author reads and questions it.
