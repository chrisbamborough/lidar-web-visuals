# LiDAR Web Visuals

## Agent Startup

Read these files before making project changes:

1. `docs/PROJECT_CONTEXT.md` - current implementation and architecture
2. `docs/NEXT_STEPS.md` - prioritized work and known cleanup targets
3. `docs/DECISIONS.md` - project decisions that should not be rediscovered
4. `docs/ROADMAP.md` - longer-term creative direction

Keep working code unchanged unless the user explicitly asks for an implementation change.

## Project Overview

This is a Vite project for browser-based, real-time LiDAR visualizations using iPhone/iPad Record3D data, WebRTC, Three.js, and `lil-gui`.

## Key Commands

- `npm run dev` - start development server, opening the default `lidar-basic` sketch
- `npm run build` - build the production version
- `npm run dev -- --port 5173` - run the dev server on a specific port
- `npm run dev -- --host 0.0.0.0` - run the dev server on all interfaces
- `npm run sketch --name=<sketch-name>` - run Vite with `SKETCH=<sketch-name>`

## Development Setup

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Open `http://localhost:5173/sketches/lidar-basic/`
4. Start Record3D Wi-Fi streaming on the iPhone/iPad and enter the device URL in the sketch UI

## Sketch Structure

Each sketch is a self-contained folder in `sketches/` with:

- `index.html` - entry point
- `main.js` - sketch logic
- `style.css` - sketch styles, or an import/reference to shared styles

## Conventions

- Use ES modules and existing Vite patterns.
- Prefer Three.js for point cloud and 3D rendering.
- Use `lil-gui` for tweakable sketch parameters.
- Put new sketches in their own folder under `sketches/`.
- Prefer shared helpers in `lib/` for new work instead of duplicating WebRTC, Three.js setup, image, or audio utilities.
- Treat hardcoded Record3D IP addresses as temporary development values.

## Gotchas

- The Vite dev proxy target in `vite.config.js` is hardcoded for one local Record3D device.
- Some sketches currently duplicate logic that also exists in `lib/`.
- `docs/ROADMAP.md` contains aspirational items that are not all implemented.
