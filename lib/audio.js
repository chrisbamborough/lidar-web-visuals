export async function setupAudio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const audioData = new Uint8Array(analyser.frequencyBinCount);
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  return { audioContext, analyser, audioData };
}

export function getAudioAmplitude(analyser, audioData) {
  analyser.getByteFrequencyData(audioData);
  return audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
}
