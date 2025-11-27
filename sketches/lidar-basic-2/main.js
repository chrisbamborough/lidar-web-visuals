// LiDAR + Sound: Based on lidar-basic, with audio-reactive point cloud
import * as THREE from "three";
import GUI from "lil-gui";
import { connectIphoneLidar } from "../../lib/iphone-lidar.js";
import { setupThree } from "../../lib/three-setup.js";
import { setupAudio, getAudioAmplitude } from "../../lib/audio.js";
import { rgbToHsv } from "../../lib/image-utils.js";

// ---------- DOM ELEMENTS ----------
const connectBtn = document.getElementById("connect");
const statsEl = document.getElementById("stats");
const errEl = document.getElementById("err");
const videoEl = document.getElementById("video");
const canvas3D = document.getElementById("three");

// ---------- GLOBALS ----------
let running = false;
let animId;

// ---------- THREE.JS SETUP ----------
const { renderer, scene, camera, controls } = setupThree(canvas3D);

// Geometry for point cloud
let geom = new THREE.BufferGeometry();
let material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
let points = new THREE.Points(geom, material);
scene.add(points);

// GUI controls
const gui = new GUI();
gui.add(material, "size", 0.001, 0.05).name("Point Size");
gui.addColor(material, "color").name("Tint");
const guiParams = {
  step: 4,
  depthRange: 3.0,
};
gui.add(guiParams, "step", 1, 16, 1).name("Step");
gui.add(guiParams, "depthRange", 1, 10, 1).name("Depth [m]");

// ---------- AUDIO SETUP ----------
let audioContext,
  analyser,
  audioData,
  audioReady = false;
async function handleAudioSetup() {
  ({ audioContext, analyser, audioData } = await setupAudio());
  audioReady = true;
}
connectBtn.addEventListener("click", handleAudioSetup, { once: true });

// ---------- IMAGE PROCESSING ----------
const readCanvas = document.createElement("canvas");
const readCtx = readCanvas.getContext("2d", { willReadFrequently: true });

function processFrame() {
  const step = Math.max(1, Math.min(16, Number(guiParams.step) || 4));
  const depthRange = Math.max(
    0.5,
    Math.min(10, Number(guiParams.depthRange) || 3.0)
  );
  const vw = videoEl.videoWidth,
    vh = videoEl.videoHeight;
  if (!vw || !vh) return;

  const half = vw >> 1;
  readCanvas.width = vw;
  readCanvas.height = vh;
  readCtx.drawImage(videoEl, 0, 0);
  const img = readCtx.getImageData(0, 0, vw, vh).data;

  const fx = half * 1.0,
    fy = vh * 1.0,
    cx = half * 0.5,
    cy = vh * 0.5;
  const N = Math.ceil(vh / step) * Math.ceil(half / step);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  let j = 0;
  for (let y = 0; y < vh; y += step) {
    for (let x = 0; x < half; x += step) {
      const di = (y * vw + x) * 4;
      const [h] = rgbToHsv(img[di], img[di + 1], img[di + 2]);
      const z = h * depthRange;
      if (z < 0.01) continue; // Skip points with no valid depth

      // const ri = (y * vw + (x + half)) * 4;
      // const r = img[ri],
      //   g = img[ri + 1],
      //   b = img[ri + 2];
      const X = ((x - cx) / fx) * z;
      const Y = ((y - cy) / fy) * z;
      const Z = z;
      // No rotation: (X, Y, Z)
      pos[j] = X; // X (no flip)
      pos[j + 1] = -Y; // Flip Y to correct upside down
      pos[j + 2] = -Z; // -Z to look at the camera
      // Set all points to the same color (e.g., white)
      col[j] = 1.0;
      col[j + 1] = 1.0;
      col[j + 2] = 1.0;
      j += 3;
    }
  }
  geom.setAttribute("position", new THREE.BufferAttribute(pos.slice(0, j), 3));
  geom.setAttribute("color", new THREE.BufferAttribute(col.slice(0, j), 3));
  geom.computeBoundingSphere();
}

// ---------- RENDER LOOP ----------
let lastT = performance.now(),
  frames = 0;
function renderLoop() {
  resize();
  controls.update();
  processFrame();
  renderer.render(scene, camera);
  frames++;
  const now = performance.now();
  if (now - lastT > 1000) {
    statsEl.textContent = `${((frames * 1000) / (now - lastT)).toFixed(1)} FPS`;
    lastT = now;
    frames = 0;
  }
  animId = requestAnimationFrame(renderLoop);
}

function resize() {
  const w = canvas3D.clientWidth,
    h = canvas3D.clientHeight;
  if (canvas3D.width !== w || canvas3D.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener("resize", resize);

// ---------- WEBRTC CONNECTION ----------
async function connect() {
  try {
    if (running) return;
    running = true;
    errEl.textContent = "";
    statsEl.textContent = "connecting...";

    // Always set up audio before connecting
    ({ audioContext, analyser, audioData } = await setupAudio());
    audioReady = true;

    await connectIphoneLidar({
      serverAddress: "http://192.168.86.28", // Always use this address
      videoEl,
      statsEl,
      errEl,
      onReady: () => {
        cancelAnimationFrame(animId);
        renderLoop();
      },
    });
  } catch (e) {
    // Error already handled in onError
  }
}

connectBtn.addEventListener("click", connect);

// ---------- INITIAL ----------
resize();
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
statsEl.textContent = "idle";
