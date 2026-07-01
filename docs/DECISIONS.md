# Decisions

## Sketches Are First-Class

Each visualization lives as a self-contained sketch under `sketches/<name>/`. A sketch should include its own `index.html`, `main.js`, and `style.css`.

## This Repository Is Not The App

The dedicated LiDAR Studio app now lives outside this repository. This project remains a sketch playground for experiments, prototypes, and shared helper code.

## Default Sketch

`lidar-basic` is the default sketch opened by the Vite dev server.

## Record3D Frame Interpretation

Current sketches interpret the incoming Record3D video frame as two horizontal halves:

- left half: HSV hue encodes depth
- right half: RGB camera image provides color

This is the working assumption for current sketches. Do not replace it with binary data-channel parsing unless that is a deliberate implementation task.

## Shared Helpers For New Work

New sketches should prefer helpers from `lib/` where practical:

- `lib/webrtc.js` for Record3D WebRTC negotiation
- `lib/iphone-lidar.js` for attaching Record3D streams to video elements
- `lib/three-setup.js` for Three.js scene setup
- `lib/image-utils.js` for color/depth utilities
- `lib/audio.js` for microphone analyser setup

Existing sketches may still contain duplicated code. Treat that as a known cleanup target, not as permission to refactor behavior during unrelated tasks.

## Configuration

Hardcoded local IP addresses are development conveniences. New work should avoid adding more hardcoded device IPs and should make the Record3D endpoint configurable.

## Roadmap Status

`docs/ROADMAP.md` is aspirational. Implemented behavior should be verified against the code, not inferred from the roadmap.
