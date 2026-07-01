# Project Context

## Purpose

LiDAR Web Visuals is a browser-based creative coding playground for visualizing iPhone/iPad Record3D LiDAR streams in real time. It uses Vite, WebRTC, Three.js, and `lil-gui` to turn Record3D video/depth data into independent point cloud sketches.

This repository is not the dedicated LiDAR Studio app. It is now focused on sketches, experiments, and shared helper modules.

## Current Implementation

The project is configured as a Vite multi-page sketch workspace. `vite.config.js` scans `sketches/` for folders that contain `index.html` and adds each sketch as a Rollup input. The default dev server page is `sketches/lidar-basic/index.html`.

Primary runtime dependencies:

- `three` for WebGL rendering and point clouds
- `lil-gui` for live visual controls
- browser WebRTC APIs for Record3D streaming
- browser Canvas APIs for reading video pixels
- browser Web Audio APIs for experimental audio reactivity

## Record3D Data Flow

The implemented sketches connect to Record3D Wi-Fi streaming with these endpoints:

- `GET /metadata`
- `GET /getOffer`
- `POST /answer`

The browser creates an `RTCPeerConnection`, accepts the Record3D offer, creates an answer, posts the answer back to the device, then receives a video stream.

The current point cloud path reads pixels from a hidden video element by drawing each frame into an offscreen canvas. The frame is treated as two horizontal halves:

- left half: depth encoded as HSV hue
- right half: RGB camera color

Depth is approximated as:

```js
z = hue * depthRange;
```

Points are downsampled using a configurable `step` value. Approximate camera intrinsics are derived from the video dimensions inside each sketch:

```js
fx = halfWidth;
fy = videoHeight;
cx = halfWidth * 0.5;
cy = videoHeight * 0.5;
```

The project does not currently use Record3D binary depth/data-channel parsing, even though that remains an aspirational roadmap item.

## Sketches

`sketches/lidar-basic/`

Default sketch. Connects to Record3D, decodes HSV depth from the left half of the video frame, samples RGB from the right half, and renders a Three.js point cloud. It has local orbit-style mouse controls and `lil-gui` controls for point size, tint, step, and depth range.

`sketches/lidar-depth/`

Depth-colored variant. It follows the same general connection and projection flow as `lidar-basic`, but colors points by depth between configurable near and far colors. It uses additive blending and transparent points for a more stylized look.

`sketches/lidar-simplePoints/`

More modular experimental sketch. It imports helpers from `lib/` for WebRTC, Three.js setup, image conversion, and audio setup. It currently requests microphone access and creates audio analyser state, but audio amplitude is not yet applied to the visual output.

## Shared Library

`lib/webrtc.js`

Generic Record3D WebRTC negotiation helper. It normalizes the server URL, fetches metadata and offer, creates an answer, waits briefly for ICE gathering, and posts the SDP answer.

`lib/iphone-lidar.js`

Small wrapper around `connectWebRTC` that attaches the incoming media stream to a video element and reports status/errors to DOM elements.

`lib/three-setup.js`

Creates a Three.js renderer, scene, perspective camera, and OrbitControls.

`lib/image-utils.js`

Contains `rgbToHsv`, used for HSV-depth decoding.

`lib/audio.js`

Sets up microphone capture and an `AnalyserNode`, plus a helper to estimate average amplitude.

## Current Rough Edges

- `lidar-basic` and `lidar-depth` duplicate WebRTC, camera, HSV conversion, and frame-processing logic instead of using `lib/`.
- Record3D IP addresses are hardcoded in a few places, including the Vite proxy and some sketch UI placeholders.
- Point cloud orientation is not fully standardized across sketches.
- Audio setup exists, but the sketches are not meaningfully audio-reactive yet.

## Working-Code Boundary

Assume the existing sketches are working experiments. Prefer new sketches, documentation, or clearly scoped refactors unless the user asks to change existing sketch behavior. If implementation changes are requested, preserve the current `lidar-basic` flow unless the task explicitly says otherwise.
