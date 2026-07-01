# Sketch Roadmap

This repository is a place for browser-based LiDAR sketch experiments using Record3D, WebRTC, Three.js, and Web Audio. The goal is to keep experiments easy to copy, compare, and throw away without turning this repo into a single product app.

## 1. Stable Sketch Foundation

- Keep each sketch independently runnable from `sketches/<name>/`.
- Keep `lidar-basic` as the small reference implementation.
- Move reusable WebRTC, projection, color, and audio utilities into `lib/` when duplication becomes distracting.

## 2. Better Point Clouds

- Tune orientation and camera defaults across sketches.
- Improve depth clipping and invalid-depth filtering.
- Explore additive, transparent, and depth-colored materials.
- Try shader-based point rendering once the CPU path is well understood.

## 3. Temporal Sketches

- Add a memory-trail sketch with a ring buffer of recent point cloud frames.
- Add fading point layers with lower opacity and slight color shifts.
- Compare CPU-managed trails with shader-based trail effects.

## 4. Mesh Surface Sketches

- Build a downsampled grid mesh from the depth half of the Record3D frame.
- Skip triangles across large depth discontinuities.
- Explore wireframe, translucent, depth-gradient, and camera-color materials.

## 5. Audio-Reactive Sketches

- Use Web Audio to measure amplitude and frequency bands.
- Drive point size, color intensity, distortion strength, and fog density from audio features.
- Keep audio permission prompts limited to sketches that actually need audio.

## 6. Capture And Performance

- Document OBS capture workflows for sketch output.
- Test 1080p and 4K browser capture performance.
- Consider GPU decoding/projection paths for high-density sketches.

## 7. Optional Archive Experiments

- Explore saving short frame sequences for offline experiments.
- Keep any heavyweight recording or ML work outside the core sketch workflow unless it becomes clearly useful.
