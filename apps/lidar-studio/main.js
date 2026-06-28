import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { rgbToHsv } from "../../lib/image-utils.js";

const STORAGE_KEY = "lidar-studio-settings";

const els = {
  canvas: document.getElementById("three"),
  video: document.getElementById("video"),
  addr: document.getElementById("addr"),
  connect: document.getElementById("connect"),
  demo: document.getElementById("demo"),
  stop: document.getElementById("stop"),
  useProxy: document.getElementById("useProxy"),
  status: document.getElementById("status"),
  sourceLabel: document.getElementById("sourceLabel"),
  error: document.getElementById("error"),
  fps: document.getElementById("fps"),
  points: document.getElementById("points"),
  frameSize: document.getElementById("frameSize"),
  resetView: document.getElementById("resetView"),
  resetControls: document.getElementById("resetControls"),
};

const defaults = {
  step: "4",
  depthRange: "3",
  nearClip: "0.02",
  farClip: "4",
  spread: "1",
  orientation: "camera",
  colorMode: "camera",
  nearColor: "#ff9d00",
  farColor: "#2e8cff",
  tintColor: "#ffffff",
  pointSize: "0.012",
  opacity: "0.95",
  brightness: "1",
  additive: true,
  twist: "0",
  wave: "0",
  spin: "0",
  useProxy: false,
  addr: "http://192.168.86.234",
};

const controls = [
  "step",
  "depthRange",
  "nearClip",
  "farClip",
  "spread",
  "orientation",
  "colorMode",
  "nearColor",
  "farColor",
  "tintColor",
  "pointSize",
  "opacity",
  "brightness",
  "additive",
  "twist",
  "wave",
  "spin",
];

for (const id of controls) {
  els[id] = document.getElementById(id);
  els[`${id}Out`] = document.getElementById(`${id}Out`);
}

const renderer = new THREE.WebGLRenderer({
  canvas: els.canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090d);
scene.fog = new THREE.FogExp2(0x07090d, 0.055);

const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 80);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.07;
orbit.minDistance = 0.12;
orbit.maxDistance = 18;

const geometry = new THREE.BufferGeometry();
geometry.setDrawRange(0, 0);

const material = new THREE.PointsMaterial({
  size: 0.012,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const pointCloud = new THREE.Points(geometry, material);
pointCloud.frustumCulled = false;
scene.add(pointCloud);

const readCanvas = document.createElement("canvas");
const readCtx = readCanvas.getContext("2d", { willReadFrequently: true });

const nearColor = new THREE.Color();
const farColor = new THREE.Color();
const tintColor = new THREE.Color();
const workColor = new THREE.Color();

let peerConnection = null;
let sourceMode = "demo";
let positions = new Float32Array(0);
let colors = new Float32Array(0);
let pointCapacity = 0;
let pointCount = 0;
let lastTime = performance.now();
let fpsLast = performance.now();
let fpsFrames = 0;

loadSettings();
syncOutputs();
updateMaterial();
resetView();
setStatus("Demo", "Synthetic source");

els.connect.addEventListener("click", connect);
els.demo.addEventListener("click", startDemo);
els.stop.addEventListener("click", stopSource);
els.resetView.addEventListener("click", resetView);
els.resetControls.addEventListener("click", resetControls);
els.addr.addEventListener("change", saveSettings);
els.useProxy.addEventListener("change", saveSettings);
window.addEventListener("resize", resize);

for (const id of controls) {
  const eventName = els[id].type === "range" ? "input" : "change";
  els[id].addEventListener(eventName, () => {
    syncOutputs();
    updateMaterial();
    saveSettings();
  });
}

requestAnimationFrame(renderLoop);

function loadSettings() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  for (const [id, value] of Object.entries({ ...defaults, ...saved })) {
    if (!els[id]) continue;
    if (els[id].type === "checkbox") {
      els[id].checked = Boolean(value);
    } else {
      els[id].value = value;
    }
  }
}

function saveSettings() {
  const data = {
    addr: els.addr.value,
    useProxy: els.useProxy.checked,
  };

  for (const id of controls) {
    data[id] = els[id].type === "checkbox" ? els[id].checked : els[id].value;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetControls() {
  for (const [id, value] of Object.entries(defaults)) {
    if (!els[id]) continue;
    if (els[id].type === "checkbox") {
      els[id].checked = Boolean(value);
    } else {
      els[id].value = value;
    }
  }

  syncOutputs();
  updateMaterial();
  saveSettings();
}

function values() {
  const nearClip = numberValue("nearClip");
  const farClip = Math.max(nearClip + 0.05, numberValue("farClip"));

  return {
    step: Math.max(1, Math.round(numberValue("step"))),
    depthRange: numberValue("depthRange"),
    nearClip,
    farClip,
    spread: numberValue("spread"),
    orientation: els.orientation.value,
    colorMode: els.colorMode.value,
    nearColor: els.nearColor.value,
    farColor: els.farColor.value,
    tintColor: els.tintColor.value,
    pointSize: numberValue("pointSize"),
    opacity: numberValue("opacity"),
    brightness: numberValue("brightness"),
    additive: els.additive.checked,
    twist: numberValue("twist"),
    wave: numberValue("wave"),
    spin: numberValue("spin"),
  };
}

function numberValue(id) {
  return Number(els[id].value);
}

function syncOutputs() {
  els.stepOut.textContent = String(Math.round(numberValue("step")));
  els.depthRangeOut.textContent = `${numberValue("depthRange").toFixed(1)} m`;
  els.nearClipOut.textContent = `${numberValue("nearClip").toFixed(2)} m`;
  els.farClipOut.textContent = `${numberValue("farClip").toFixed(1)} m`;
  els.spreadOut.textContent = numberValue("spread").toFixed(2);
  els.pointSizeOut.textContent = numberValue("pointSize").toFixed(3);
  els.opacityOut.textContent = numberValue("opacity").toFixed(2);
  els.brightnessOut.textContent = numberValue("brightness").toFixed(2);
  els.twistOut.textContent = numberValue("twist").toFixed(2);
  els.waveOut.textContent = numberValue("wave").toFixed(2);
  els.spinOut.textContent = numberValue("spin").toFixed(2);
}

function updateMaterial() {
  const v = values();
  material.size = v.pointSize;
  material.opacity = v.opacity;
  material.blending = v.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  material.depthWrite = !v.additive;
  material.needsUpdate = true;
}

async function connect() {
  stopPeerConnection();
  clearError();
  els.connect.disabled = true;
  setStatus("Connecting", "Record3D");

  const serverAddress = els.useProxy.checked ? "/webrtc" : els.addr.value.trim();

  if (!serverAddress) {
    showError("Enter a Record3D URL or enable the proxy.");
    els.connect.disabled = false;
    setStatus(sourceMode === "demo" ? "Demo" : "Idle", els.sourceLabel.textContent);
    return;
  }

  try {
    peerConnection = await connectRecord3D(serverAddress);
    sourceMode = "lidar";
    saveSettings();
    setStatus("Live", serverAddress);
  } catch (error) {
    showError(error);
    els.connect.disabled = false;
    startDemo();
  }
}

async function connectRecord3D(serverAddress) {
  const server = normalizeServer(serverAddress);
  const pc = new RTCPeerConnection({ iceServers: [] });

  pc.oniceconnectionstatechange = () => {
    if (sourceMode === "lidar" || els.status.textContent === "Connecting") {
      els.status.textContent = pc.iceConnectionState;
    }
  };

  pc.ontrack = (event) => {
    els.video.srcObject = event.streams[0];
    els.video.play();
  };

  try {
    await fetchJson(`${server}/metadata`, "metadata");
    const offer = await fetchJson(`${server}/getOffer`, "getOffer");
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForIce(pc);

    const response = await fetch(`${server}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "answer", data: pc.localDescription.sdp }),
    });

    if (!response.ok) {
      throw new Error(`answer ${response.status} ${response.statusText}`);
    }

    return pc;
  } catch (error) {
    pc.close();
    throw error;
  }
}

function normalizeServer(serverAddress) {
  let server = serverAddress.trim();

  if (!server) {
    throw new Error("Record3D URL is required.");
  }

  if (server.startsWith("/")) {
    return server.replace(/\/+$/, "");
  }

  if (!/^https?:\/\//i.test(server)) {
    server = `http://${server}`;
  }

  return server.replace(/\/+$/, "");
}

async function fetchJson(url, label) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${label} ${response.status} ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${label} response is not JSON`);
  }
}

function waitForIce(pc) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
      return;
    }

    const onChange = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      }
    };

    pc.addEventListener("icegatheringstatechange", onChange);
    setTimeout(resolve, 3000);
  });
}

function startDemo() {
  stopPeerConnection();
  sourceMode = "demo";
  els.connect.disabled = false;
  clearError();
  setStatus("Demo", "Synthetic source");
}

function stopSource() {
  stopPeerConnection();
  sourceMode = "none";
  pointCount = 0;
  geometry.setDrawRange(0, 0);
  els.connect.disabled = false;
  setStatus("Idle", "No source");
}

function stopPeerConnection() {
  if (peerConnection) {
    peerConnection.getSenders().forEach((sender) => sender.track?.stop());
    peerConnection.getReceivers().forEach((receiver) => receiver.track?.stop());
    peerConnection.close();
    peerConnection = null;
  }

  if (els.video.srcObject) {
    els.video.srcObject.getTracks().forEach((track) => track.stop());
    els.video.srcObject = null;
  }
}

function renderLoop(now) {
  resize();

  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  const v = values();
  pointCloud.rotation.y += v.spin * dt;

  if (sourceMode === "lidar") {
    processVideoFrame(now / 1000, v);
  } else if (sourceMode === "demo") {
    processDemoFrame(now / 1000, v);
  }

  orbit.update();
  renderer.render(scene, camera);
  updateReadout(now);

  requestAnimationFrame(renderLoop);
}

function resize() {
  const width = els.canvas.clientWidth;
  const height = els.canvas.clientHeight;

  if (els.canvas.width !== width || els.canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }
}

function resetView() {
  camera.position.set(0, 0.12, 2.4);
  orbit.target.set(0, 0, 0);
  orbit.update();
  pointCloud.rotation.set(0, 0, 0);
}

function processVideoFrame(time, v) {
  const width = els.video.videoWidth;
  const height = els.video.videoHeight;

  if (!width || !height) return;

  const halfWidth = width >> 1;
  const capacity = Math.ceil(height / v.step) * Math.ceil(halfWidth / v.step);
  ensureGeometryCapacity(capacity);

  readCanvas.width = width;
  readCanvas.height = height;
  readCtx.drawImage(els.video, 0, 0);

  const image = readCtx.getImageData(0, 0, width, height).data;
  const fx = halfWidth;
  const fy = height;
  const cx = halfWidth * 0.5;
  const cy = height * 0.5;

  prepareColors(v);

  let count = 0;

  for (let y = 0; y < height; y += v.step) {
    for (let x = 0; x < halfWidth; x += v.step) {
      const depthIndex = (y * width + x) * 4;
      const [hue] = rgbToHsv(
        image[depthIndex],
        image[depthIndex + 1],
        image[depthIndex + 2]
      );
      const z = hue * v.depthRange;

      if (z < v.nearClip || z > v.farClip) continue;

      const colorIndex = (y * width + (x + halfWidth)) * 4;
      const rawR = image[colorIndex] / 255;
      const rawG = image[colorIndex + 1] / 255;
      const rawB = image[colorIndex + 2] / 255;

      count = writePoint(
        count,
        ((x - cx) / fx) * z,
        ((y - cy) / fy) * z,
        z,
        rawR,
        rawG,
        rawB,
        time,
        v
      );
    }
  }

  commitGeometry(count);
  els.frameSize.textContent = `${halfWidth} x ${height}`;
}

function processDemoFrame(time, v) {
  const width = 180;
  const height = 120;
  const capacity = Math.ceil(height / v.step) * Math.ceil(width / v.step);
  ensureGeometryCapacity(capacity);
  prepareColors(v);

  let count = 0;

  for (let y = 0; y < height; y += v.step) {
    for (let x = 0; x < width; x += v.step) {
      const nx = (x / (width - 1) - 0.5) * 2;
      const ny = (y / (height - 1) - 0.5) * 2;
      const ripple =
        Math.sin(nx * 4.2 + time * 1.4) * 0.18 +
        Math.cos(ny * 4.8 - time * 1.1) * 0.15 +
        Math.sin((nx + ny) * 3.5 + time * 0.8) * 0.1;
      const z = THREE.MathUtils.clamp(
        v.depthRange * (0.45 + ripple),
        v.nearClip,
        v.farClip
      );

      const rawR = 0.55 + 0.45 * Math.sin(time + nx * 2.4);
      const rawG = 0.55 + 0.45 * Math.sin(time * 0.8 + ny * 2.8 + 1.5);
      const rawB = 0.55 + 0.45 * Math.sin(time * 1.1 + nx * ny * 4 + 3);

      count = writePoint(
        count,
        nx * z * 0.42,
        ny * z * 0.34,
        z,
        rawR,
        rawG,
        rawB,
        time,
        v
      );
    }
  }

  commitGeometry(count);
  els.frameSize.textContent = `${width} x ${height}`;
}

function prepareColors(v) {
  nearColor.set(v.nearColor);
  farColor.set(v.farColor);
  tintColor.set(v.tintColor);
}

function writePoint(count, x, y, z, rawR, rawG, rawB, time, v) {
  let px;
  let py;
  let pz;

  if (v.orientation === "stage") {
    px = z;
    py = -y;
    pz = -x;
  } else {
    px = x;
    py = -y;
    pz = -z;
  }

  px *= v.spread;
  py *= v.spread;

  if (v.twist !== 0) {
    const t = THREE.MathUtils.clamp(z / Math.max(0.001, v.depthRange), 0, 1);
    const angle = v.twist * (t - 0.5);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nextX = px * cos - pz * sin;
    const nextZ = px * sin + pz * cos;
    px = nextX;
    pz = nextZ;
  }

  if (v.wave !== 0) {
    py += Math.sin(px * 4 + time * 2.1) * v.wave * 0.08;
    pz += Math.cos(py * 5 + time * 1.7) * v.wave * 0.05;
  }

  const i = count * 3;
  positions[i] = px;
  positions[i + 1] = py;
  positions[i + 2] = pz;

  writeColor(i, z, py, rawR, rawG, rawB, time, v);

  return count + 1;
}

function writeColor(i, z, y, rawR, rawG, rawB, time, v) {
  const depthT = THREE.MathUtils.clamp(
    (z - v.nearClip) / Math.max(0.001, v.farClip - v.nearClip),
    0,
    1
  );
  const heightT = THREE.MathUtils.clamp((y + v.depthRange * 0.5) / v.depthRange, 0, 1);

  if (v.colorMode === "camera") {
    workColor.setRGB(rawR, rawG, rawB);
  } else if (v.colorMode === "height") {
    workColor.copy(nearColor).lerp(farColor, heightT);
  } else if (v.colorMode === "rainbow") {
    workColor.setHSL((depthT * 0.65 + time * 0.03) % 1, 0.9, 0.58);
  } else if (v.colorMode === "mono") {
    workColor.setRGB(1, 1, 1);
  } else {
    workColor.copy(nearColor).lerp(farColor, depthT);
  }

  workColor.multiply(tintColor).multiplyScalar(v.brightness);

  colors[i] = workColor.r;
  colors[i + 1] = workColor.g;
  colors[i + 2] = workColor.b;
}

function ensureGeometryCapacity(capacity) {
  if (capacity <= pointCapacity) return;

  pointCapacity = capacity;
  positions = new Float32Array(pointCapacity * 3);
  colors = new Float32Array(pointCapacity * 3);

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
  );
}

function commitGeometry(count) {
  pointCount = count;
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
  geometry.setDrawRange(0, pointCount);
}

function updateReadout(now) {
  fpsFrames += 1;

  if (now - fpsLast > 500) {
    const fps = (fpsFrames * 1000) / (now - fpsLast);
    els.fps.textContent = `${fps.toFixed(0)} FPS`;
    els.points.textContent = `${pointCount.toLocaleString()} points`;
    fpsFrames = 0;
    fpsLast = now;
  }
}

function setStatus(status, sourceLabel) {
  els.status.textContent = status;
  els.sourceLabel.textContent = sourceLabel;
}

function showError(error) {
  els.error.textContent = error?.message || String(error);
}

function clearError() {
  els.error.textContent = "";
}
