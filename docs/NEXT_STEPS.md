# Next Steps

## Priority 1: Make Return Visits Easy

- Keep `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/NEXT_STEPS.md`, and `docs/DECISIONS.md` current when project direction changes.
- When a task changes behavior, add a short note here describing what changed and what remains.
- Keep roadmap ideas in `docs/ROADMAP.md`; keep current implementation facts in `docs/PROJECT_CONTEXT.md`.

## Priority 2: Stabilize Configuration

- Replace hardcoded Record3D IP addresses with a single configurable path.
- Decide whether blank address fields should always use the Vite `/webrtc` proxy.
- Document the expected Record3D URL format in the UI or README.

## Priority 3: Reduce Duplication

- Move common WebRTC connection logic from `lidar-basic` and `lidar-depth` into `lib/`.
- Move common frame decoding/projection utilities into `lib/`.
- Standardize camera controls and point cloud orientation across sketches.

## Priority 4: Improve Visual Experiments

- Add a dedicated audio-reactive sketch where microphone amplitude visibly drives point size, color, or distortion.
- Add a memory-trail sketch that keeps a ring buffer of recent point cloud frames.
- Explore a shader-based point renderer once the CPU point cloud path is stable.

## Priority 5: Repository Hygiene

- Decide whether `src/` is still needed as a runnable app path or only as shared style/code.
- Remove or repurpose leftover Vite sample files when they are no longer useful.
- Add the missing `LICENSE` file or remove the README license reference.

## Caution

Do not change working sketch behavior as part of documentation or cleanup tasks. Keep code edits explicit and narrowly scoped.
