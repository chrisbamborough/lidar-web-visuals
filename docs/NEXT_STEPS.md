# Next Steps

## Priority 1: Keep The Sketch Workspace Clear

- Keep this repository focused on `sketches/`, `lib/`, and documentation.
- Keep `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/NEXT_STEPS.md`, and `docs/DECISIONS.md` current when project direction changes.
- Keep app/product work in the separate LiDAR Studio project.

## Priority 2: Stabilize Configuration

- Replace hardcoded Record3D IP addresses with a single configurable path.
- Decide whether blank address fields should always use the Vite `/webrtc` proxy.
- Document the expected Record3D URL format in each sketch UI or README.

## Priority 3: Reduce Duplication

- Move common WebRTC connection logic from `lidar-basic` and `lidar-depth` into `lib/`.
- Move common frame decoding/projection utilities into `lib/`.
- Standardize camera controls and point cloud orientation across sketches.

## Priority 4: Add Focused Sketch Experiments

- Add a dedicated audio-reactive sketch where microphone amplitude visibly drives point size, color, or distortion.
- Add a memory-trail sketch that keeps a ring buffer of recent point cloud frames.
- Add a mesh-surface sketch that builds a downsampled surface from the depth half of the Record3D frame.
- Explore a shader-based point renderer once the CPU point cloud path is stable.

## Priority 5: Repository Hygiene

- Add the missing `LICENSE` file if the project should be published as MIT.
- Consider adding a generated sketch index page later, but keep it separate from the sketches themselves.

## Caution

Do not change working sketch behavior as part of documentation or cleanup tasks. Keep code edits explicit and narrowly scoped.
