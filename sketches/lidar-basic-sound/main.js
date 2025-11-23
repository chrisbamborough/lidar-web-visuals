// LiDAR + Sound: Based on lidar-basic, with audio-reactive point cloud
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------- DOM ELEMENTS ----------
const addrEl = document.getElementById("addr");
const connectBtn = document.getElementById("connect");
const statsEl = document.getElementById("stats");
const errEl = document.getElementById("err");
const videoEl = document.getElementById("video");
const canvas3D = document.getElementById("three");

// ---------- GLOBALS ----------
let pc; // RTCPeerConnection
let running = false;
let animId;

// ---------- THREE.JS SETUP ----------
const renderer = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);
const camera = new THREE.PerspectiveCamera(60, 2, 0.01, 50);
camera.position.set(0, 0, 1.5); // Start a bit back for a better view

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true; // Smooth camera motion
controls.dampingFactor = 0.05;
controls.minDistance = 0.5;
controls.maxDistance = 10;

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
gui.add(guiParams, "depthRange", 1, 10, 0.1).name("Depth [m]");

// ---------- AUDIO SETUP ----------
let audioContext,
  analyser,
  audioData,
  audioReady = false;
async function setupAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  audioData = new Uint8Array(analyser.frequencyBinCount);
  // Use the first available input (mic or line-in)
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  audioReady = true;
}
connectBtn.addEventListener("click", setupAudio, { once: true });

// ---------- IMAGE PROCESSING ----------
const readCanvas = document.createElement("canvas");
const readCtx = readCanvas.getContext("2d", { willReadFrequently: true });

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h /= 6;
  }
  if (h < 0) h += 1;
  return [h, max === 0 ? 0 : d / max, max];
}

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

  // Get audio amplitude (average of frequency bins)
  let audioAmp = 0;
  if (audioReady && analyser) {
    analyser.getByteFrequencyData(audioData);
    audioAmp = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
  }

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
      const ri = (y * vw + (x + half)) * 4;
      const r = img[ri],
        g = img[ri + 1],
        b = img[ri + 2];
      const X = ((x - cx) / fx) * z;
      const Y = ((y - cy) / fy) * z;
      const Z = z;
      // Rotate 90 degrees CCW around Y axis: (X, Y, Z) -> (Z, Y, -X)
      // Add audio reactivity: modulate Y by audio amplitude
      pos[j] = Z;
      pos[j + 1] = -Y + audioAmp * 0.2 * Math.sin(j); // wiggle with sound
      pos[j + 2] = -X;
      col[j] = r / 255;
      col[j + 1] = g / 255;
      col[j + 2] = b / 255;
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
  controls.update(); // Add this line
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

// ---------- WEBRTC CONNECTION ----------
async function connect() {
  try {
    if (running) return;
    running = true;
    errEl.textContent = "";
    statsEl.textContent = "connecting...";

    let server = addrEl.value.trim();
    if (!server.startsWith("http")) server = "http://" + server;
    server = server.replace(/\/+$/, "");

    pc = new RTCPeerConnection({ iceServers: [] });
    pc.oniceconnectionstatechange = () => {
      statsEl.textContent = `state: ${pc.iceConnectionState}`;
    };
    pc.ontrack = (ev) => {
      videoEl.srcObject = ev.streams[0];
      videoEl.play();
    };

    const meta = await fetch(server + "/metadata").then((r) => r.json());
    console.log("metadata", meta);

    const offer = await fetch(server + "/getOffer").then((r) => r.json());
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // wait for ICE gathering complete
    await new Promise((res) => {
      if (pc.iceGatheringState === "complete") return res();
      const check = () => {
        if (pc.iceGatheringState === "complete") {
          pc.removeEventListener("icegatheringstatechange", check);
          res();
        }
      };
      pc.addEventListener("icegatheringstatechange", check);
      setTimeout(res, 3000);
    });

    await fetch(server + "/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "answer", data: pc.localDescription.sdp }),
    });

    cancelAnimationFrame(animId);
    renderLoop();
  } catch (e) {
    console.error(e);
    errEl.textContent = e.message || String(e);
    connectBtn.disabled = false;
    running = false;
  }
}

connectBtn.addEventListener("click", connect);

// ---------- INITIAL ----------
resize();
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
statsEl.textContent = "idle";
