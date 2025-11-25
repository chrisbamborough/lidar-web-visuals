import { connectWebRTC } from "./webrtc.js";

/**
 * Connects to iPhone LiDAR stream and attaches it to a video element.
 * @param {Object} opts
 * @param {string} opts.serverAddress - The WebRTC server address.
 * @param {HTMLVideoElement} opts.videoEl - The video element to attach the stream to.
 * @param {HTMLElement} [opts.statsEl] - Optional element to show connection stats.
 * @param {HTMLElement} [opts.errEl] - Optional element to show errors.
 * @param {Function} [opts.onReady] - Optional callback when video is ready.
 * @returns {Promise<RTCPeerConnection>}
 */
export async function connectIphoneLidar({
  serverAddress,
  videoEl,
  statsEl,
  errEl,
  onReady,
}) {
  return connectWebRTC({
    serverAddress,
    statsEl,
    onStateChange: (state) => {
      if (statsEl) statsEl.textContent = `state: ${state}`;
    },
    onTrack: (stream) => {
      videoEl.srcObject = stream;
      videoEl.play();
      if (onReady) onReady(stream);
    },
    onError: (e) => {
      if (errEl) errEl.textContent = e.message || String(e);
      if (statsEl) statsEl.textContent = "error";
    },
  });
}
