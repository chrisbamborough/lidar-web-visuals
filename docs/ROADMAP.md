LiDAR DJ Visuals – Project Roadmap

This project uses iPhone LiDAR (Record3D) + WebRTC + WebGL to create music-reactive point cloud visuals for a recorded DJ set (captured via OBS with audio).

The goal is to treat LiDAR + audio as creative material, inspired by Refik Anadol’s approach:
data → transformation → memory → dreamlike visuals.

⸻

0. Tech Stack (assumed / recommended)
   • Runtime: Browser (Vite + TypeScript or plain JS)
   • 3D / Rendering: Three.js (WebGL)
   • Streaming: WebRTC (data channel from Record3D)
   • Audio Analysis: Web Audio API
   • Recording: OBS (desktop capture of browser window + audio)

You can adapt this to another stack (Unity, TouchDesigner, Unreal), but the roadmap assumes a browser + Three.js setup.

⸻

1. Basic WebRTC LiDAR Receiver

Goal: Receive LiDAR frames from Record3D over WebRTC and parse them into usable depth + RGB data.

Tasks
• Set up a simple web page (index.html / src/main.ts) that:
• Connects to Record3D via WebRTC.
• Receives binary data messages (depth + RGB).
• Parses messages into Float32Array or Uint16Array for depth and Uint8Array for RGB.
• Log one frame to confirm correct parsing (width, height, buffers).

2. Reconstruct a Live Point Cloud in Three.js

Goal: Turn each LiDAR frame into a dynamic point cloud rendered in 3D.

Tasks
• Initialize a Three.js scene (Scene, PerspectiveCamera, WebGLRenderer).
• Convert depth map + intrinsics into XYZ coordinates.
• Build a BufferGeometry with:
• position attribute (Float32Array)
• color attribute (Float32Array or Uint8Array normalized)
• Create THREE.Points with PointsMaterial and add to the scene.
• Update geometry each frame when a new LiDAR frame arrives.

3. Visual “Engine”: Make the Point Cloud Look Good

Goal: Move from “debug point cloud” to an aesthetic, cinematic look.

Tasks
• Use additive blending, transparent points, and sizeAttenuation.
• Color points by:
• depth
• height (y-coordinate)
• or RGB from camera.
• Add basic fog to the scene for depth.
• Add camera controls or a scripted camera orbit.

4. Temporal Echoes & “Memory Trails”

Goal: Make the point cloud feel like it’s remembering motion over time.

Tasks
• Keep a ring buffer of the last N frames of point data.
• Render multiple THREE.Points layers, each:
• lower opacity than the previous one
• slightly color shifted
• Fade old frames out over time.

5. Audio-Reactive Visuals (Web Audio + Shaders)

Goal: Use the DJ set audio to drive visual parameters.

Tasks
• Use Web Audio API to:
• create AudioContext
• connect the audio source (mic, file, or loopback)
• create an AnalyserNode
• Extract:
• overall amplitude
• low / mid / high frequency energy
• Map audio features to:
• point size
• color intensity / hue
• distortion strength
• fog density

6. Custom Shader Effects (Noise, Flow, “Hallucination” Modes)

Goal: Make the visuals feel fluid and dreamlike through GPU-based distortion.

Tasks
• Replace PointsMaterial with ShaderMaterial using custom vertex and fragment shaders.
• Add:
• vertex displacement via 3D noise (curl noise, Perlin, or simple pseudo-noise)
• time uniform
• audio-driven uniforms (e.g., uBass, uMid, uHigh)
• Implement multiple visual modes:
• Scan Reality: minimal distortion, neutral colors
• Memory: echo trails + warm gradients
• Hallucination: strong noise distortions + saturated colors
• Dark Mode: sparse, glowing points, low brightness

7. Post-Processing for a Cinematic Look

Goal: Add subtle post effects to make the final output feel polished.

Tasks
• Use Three.js EffectComposer:
• RenderPass
• UnrealBloomPass (small intensity)
• optional vignette or color correction pass
• Ensure performance is still OK at your target resolution.

8. OBS Integration & Recording

Goal: Capture the final visuals + audio into a recorded DJ set video.

Tasks
• Run the web app in a window at target resolution (1080p or 4K).
• In OBS:
• Add a Window Capture for the browser.
• Add the audio source (either system audio, deck output, or audio interface).
• Test recording:
• Confirm frame rate (ideally 60 FPS).
• Confirm audio sync.
• Optionally, add a minor color LUT or sharpening filter in OBS.

(No Copilot needed here, just OBS setup notes.)

⸻

9. “Memory Archive” (Optional – ML / Dataset)

Goal: Reuse LiDAR sequences later for non-realtime “machine dream” renders.

Tasks
• Add an option to record LiDAR frames to disk:
• Save JSON or binary files per frame or per sequence.
• Later: use Python / PyTorch to:
• treat depth maps as grayscale images
• train small models (e.g., autoencoders, style transfer, diffusion on depth images)
• Render offline “hallucinated” point cloud sequences for higher-res videos.
