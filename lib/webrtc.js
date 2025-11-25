export async function connectWebRTC({
  serverAddress,
  onStateChange,
  onTrack,
  onError,
  statsEl,
}) {
  let pc;
  try {
    let server = serverAddress.trim();
    if (!server.startsWith("http")) server = "http://" + server;
    server = server.replace(/\/+$/, "");

    pc = new RTCPeerConnection({ iceServers: [] });
    pc.oniceconnectionstatechange = () => {
      if (onStateChange) onStateChange(pc.iceConnectionState);
      if (statsEl) statsEl.textContent = `state: ${pc.iceConnectionState}`;
    };
    pc.ontrack = (ev) => {
      if (onTrack) onTrack(ev.streams[0]);
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

    return pc;
  } catch (e) {
    console.error(e);
    if (onError) onError(e);
    if (statsEl) statsEl.textContent = e.message || String(e);
    throw e;
  }
}
