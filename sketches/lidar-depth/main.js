// Depth-colored LiDAR point cloud
import * as THREE from "three";
import GUI from "lil-gui";

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
let phi = 0,
  theta = Math.PI,
  dist = 1.5,
  dragging = false,
  lx = 0,
  ly = 0;

const renderer = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);
const camera = new THREE.PerspectiveCamera(60, 2, 0.01, 50);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -1);

canvas3D.addEventListener("wheel", (e) => {
  dist *= 1 + Math.sign(e.deltaY) * 0.1;
  e.preventDefault();
});
canvas3D.addEventListener("mousedown", (e) => {
  dragging = true;
  lx = e.clientX;
  ly = e.clientY;
});
window.addEventListener("mouseup", () => (dragging = false));
window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  theta += (e.clientX - lx) * 0.005;
  phi += (e.clientY - ly) * 0.005;
  lx = e.clientX;
  ly = e.clientY;
});
function updateCamera() {
  const y = Math.max(-Math.PI / 2 + 0.001, Math.min(Math.PI / 2 - 0.001, phi));
  camera.position.set(
    Math.cos(theta) * Math.cos(y) * dist,
    Math.sin(y) * dist,
    Math.sin(theta) * Math.cos(y) * dist
  );
  camera.lookAt(0, 0, 0);
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

// Geometry for point cloud
let geom = new THREE.BufferGeometry();
let material = new THREE.PointsMaterial({
  size: 0.012,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
});
let points = new THREE.Points(geom, material);
scene.add(points);

// GUI controls
const guiParams = {
  step: 4,
  depthRange: 3.0,
  pointSize: 0.012,
  nearColor: "#ff9d00", // warm near
  farColor: "#2e6cff", // cool far
};
const gui = new GUI();
gui.add(guiParams, "step", 1, 16, 1).name("Step");
gui.add(guiParams, "depthRange", 1, 10, 0.1).name("Depth [m]");
gui
  .add(guiParams, "pointSize", 0.004, 0.06, 0.001)
  .name("Point Size")
  .onChange((v) => {
    material.size = v;
  });
gui.addColor(guiParams, "nearColor").name("Near Color");
gui.addColor(guiParams, "farColor").name("Far Color");

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
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
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

  const fx = half * 1.0,
    fy = vh * 1.0,
    cx = half * 0.5,
    cy = vh * 0.5;
  const N = Math.ceil(vh / step) * Math.ceil(half / step);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const near = new THREE.Color(guiParams.nearColor);
  const far = new THREE.Color(guiParams.farColor);

  let j = 0;
  for (let y = 0; y < vh; y += step) {
    for (let x = 0; x < half; x += step) {
      const di = (y * vw + x) * 4;
      const [h] = rgbToHsv(img[di], img[di + 1], img[di + 2]);
      const z = h * depthRange; // meters (approx)

      // Sample the right half for color is not needed; we color by depth
      // Project to camera space
      const X = ((x - cx) / fx) * z;
      const Y = ((y - cy) / fy) * z;
      const Z = z;

      // Rotate 90° CCW around Y: (X,Y,Z) -> (Z, Y, -X)
      pos[j] = Z;
      pos[j + 1] = -Y;
      pos[j + 2] = -X;

      // Depth-based color: t=0 near, t=1 far
      const t = Math.max(0, Math.min(1, z / depthRange));
      const c = new THREE.Color().copy(near).lerp(far, t);
      col[j] = c.r;
      col[j + 1] = c.g;
      col[j + 2] = c.b;

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
  updateCamera();
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

    let input = addrEl.value.trim();
    let useProxy = false;
    let server = "";
    if (!input) {
      useProxy = true; // dev proxy
    } else {
      server = input;
      if (!server.startsWith("http")) server = "http://" + server;
      server = server.replace(/\/+$/, "");
    }

    pc = new RTCPeerConnection({ iceServers: [] });
    pc.oniceconnectionstatechange = () => {
      statsEl.textContent = `state: ${pc.iceConnectionState}`;
    };
    pc.ontrack = (ev) => {
      videoEl.srcObject = ev.streams[0];
      videoEl.play();
    };

    const base = useProxy ? "/webrtc" : server;

    const metaResp = await fetch(base + "/metadata");
    if (!metaResp.ok)
      throw new Error(`metadata ${metaResp.status} ${metaResp.statusText}`);
    const meta = await metaResp.json().catch(() => {
      throw new Error("metadata is not JSON");
    });
    console.log("metadata", meta);

    const offerResp = await fetch(base + "/getOffer");
    if (!offerResp.ok)
      throw new Error(`getOffer ${offerResp.status} ${offerResp.statusText}`);
    const offer = await offerResp.json().catch(() => {
      throw new Error("getOffer is not JSON");
    });

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

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

    const answerResp = await fetch(base + "/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "answer", data: pc.localDescription.sdp }),
    });
    if (!answerResp.ok)
      throw new Error(`answer ${answerResp.status} ${answerResp.statusText}`);

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
