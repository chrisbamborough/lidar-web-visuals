# LiDAR Web Visuals

Browser-based creative coding sketches for real-time iPhone/iPad Record3D LiDAR streams. This repository is intentionally a sketch playground: each visualization lives in `sketches/<name>/` and can be opened independently during Vite development.

The dedicated app work has moved out of this repository. Keep this repo focused on experiments, prototypes, and reusable helper code for sketches.

## Getting Started

```bash
npm install
npm run dev
```

Vite opens the default sketch:

```text
http://localhost:5173/sketches/lidar-basic/
```

To open a specific sketch from the command line:

```bash
npm run sketch --name=lidar-depth
```

## Record3D Setup

1. Open Record3D on the iPhone or iPad.
2. Start Wi-Fi streaming and keep the device awake.
3. Copy the device URL, for example `http://192.168.x.x`.
4. Paste it into the sketch UI and click Connect.

Both devices need to be on the same local network. Use `http://` for the page and phone URL; serving the page over `https://` can block direct `http://` device connections.

## Project Structure

- `sketches/` - self-contained sketch folders with `index.html`, `main.js`, and `style.css`
- `lib/` - shared helper modules for WebRTC, Three.js setup, image utilities, and audio
- `docs/` - current context, decisions, next steps, and roadmap notes
- `vite.config.js` - multi-page Vite config that auto-indexes sketch folders

## Current Sketches

- `lidar-basic` - default RGB point cloud sketch.
- `lidar-depth` - depth-colored point cloud variant.
- `lidar-simplePoints` - modular experiment using helpers from `lib/`, with early audio setup.

## Creating A Sketch

```bash
cp -r sketches/lidar-basic sketches/my-new-sketch
npm run sketch --name=my-new-sketch
```

Then edit the new sketch's `index.html`, `main.js`, and `style.css`.

## Conventions

- Keep new work under `sketches/<name>/`.
- Prefer shared helpers in `lib/` instead of duplicating WebRTC, Three.js setup, image, or audio utilities.
- Use ES modules and Vite-compatible imports.
- Use Three.js for point cloud and 3D rendering.
- Use `lil-gui` for tweakable visual parameters when useful.
- Avoid adding new hardcoded Record3D IP addresses.

## Troubleshooting

- No video or point cloud: confirm Record3D is streaming, the IP is correct, and no other browser/device is connected.
- Fetch or JSON parse errors: check that the URL points to the Record3D device and includes `http://`.
- Poor performance: increase the sketch's `Step` or density control to downsample points.
