# Copilot Instructions for lidar-web-visuals

## Project Overview

This repository contains interactive web sketches for visualizing and experimenting with LiDAR data, primarily from iPhone Record3D, using Three.js and WebRTC. Some sketches also include audio reactivity using the Web Audio API.

## Key Technologies

- JavaScript (ES6 modules)
- Three.js (3D rendering)
- WebRTC (video/data streaming)
- Web Audio API (for sound-reactive sketches)
- Vite (dev server/build)

## Folder Structure

- `/src/` — Shared or main app code
- `/sketches/lidar-basic/` — Minimal LiDAR point cloud visualizer
- `/sketches/lidar-basic-sound/` — LiDAR visualizer with audio reactivity
- `/public/` — Static assets

## Coding Conventions

- Use ES6 modules and modern JS syntax
- Prefer Three.js for all 3D/point cloud rendering
- Use GUI controls (lil-gui) for user-tweakable parameters
- Keep UI minimal and focused on the visualization
- Place new sketches in `/sketches/` as their own folders

## How to Run

- Use `npm install` at the repo root
- Use `npm run dev` to start the Vite dev server
- Open the relevant sketch HTML file in the browser (e.g., `/sketches/lidar-basic/index.html`)

## Copilot-Specific Guidance

- When adding new features, prefer modular, readable code
- For new visualizations, start from an existing sketch if possible
- For sound reactivity, use the Web Audio API and make effects visually clear
- If unsure about LiDAR data mapping, ask for clarification
- Always check and update the script path in HTML to avoid loading the wrong file

## Known Issues / TODOs

- Some sketches may have hardcoded IPs for LiDAR streaming
- Point cloud orientation may need tuning for new data sources
- Audio reactivity is experimental—suggest improvements!

---

Feel free to update this file as the project evolves or as Copilot guidance needs to change.
