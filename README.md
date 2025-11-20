bash

# LiDAR Web Visuals

Browser-based, real-time LiDAR visualizations using iPhone/iPad Record3D, Three.js, and WebRTC. Fork or clone this repo to create your own interactive 3D LiDAR sketches, or to contribute new features and ideas.

---

## 🚦 Getting Started

### 1. Fork or Clone

Click "Fork" on GitHub, or clone locally:

```bash
git clone https://github.com/chrisbamborough/lidar-web-visuals.git
cd lidar-web-visuals
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Dev Server

```bash
npm run dev
```

Vite will print a local URL (e.g. http://localhost:5173/).

### 4. Open a Sketch

In your browser, go to:

```
http://localhost:5173/sketches/lidar-basic/
```

or any other sketch folder in `/sketches/`.

### 5. Connect Your iPhone/iPad (Record3D)

1. Open the Record3D app → Wi-Fi Streaming
2. Turn the red toggle ON and keep the screen awake
3. Note the IP address (e.g. `http://192.168.86.28`)
4. Enter this IP in the sketch UI and click Connect

**Tip:** Both your computer and iOS device must be on the same Wi-Fi network.

---

## 🗂️ Project Structure

- `sketches/` — Each folder is a self-contained sketch (like p5/Processing)
- `src/` — Shared or main app code
- `public/` — Static assets
- `vite.config.js` — Vite config (multi-page, auto-indexes sketches)

---

## 🛠️ Creating Your Own Sketch

1. Copy an existing sketch:
   ```bash
   cp -r sketches/lidar-basic sketches/my-new-sketch
   ```
2. Edit `main.js`, `index.html`, and `style.css` in your new folder
3. Open `http://localhost:5173/sketches/my-new-sketch/` in your browser

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please:

- Keep new sketches in their own folders under `/sketches/`
- Use modern JavaScript (ES6 modules)
- Prefer Three.js for 3D/point cloud rendering
- Use GUI controls (lil-gui) for user-tweakable parameters
- Keep UI minimal and focused on the visualization

---

## ℹ️ Troubleshooting

- **No video/point cloud?**
  - Make sure Record3D is streaming and the IP is correct
  - Use `http://` (not `https://`) for both the page and the phone
  - Only one browser/device can connect to Record3D at a time
- **Performance issues?**
  - Increase the "Step" value in the GUI to downsample
  - For advanced users: move decoding/projection to GPU shaders
- **IP changed?**
  - Re-check the IP in Record3D and reconnect

---

## 📚 More Info

- See [`copilot-instructions.md`](./copilot-instructions.md) for project conventions and Copilot guidance
- See comments in each sketch's `main.js` for implementation details

---

## License

MIT. See [LICENSE](./LICENSE).

Connect from the sketch
In the webpage input, enter the phone URL (e.g. http://192.168.86.28) and click Connect.
You should see a live point cloud (adjust Step and Depth as needed).

Use http:// for both the page and the phone. Opening the page on https:// will block http://phone-ip (mixed content).

➕ Create a new sketch
Copy an existing one and rename:

bash
Copy code
cp -r sketches/lidar-basic sketches/my-new-idea
Open sketches/my-new-idea/ and edit main.js.
Then visit http://localhost:5173/sketches/my-new-idea/.

⚙️ Vite configuration
vite.config.js is set to treat each sketches/<name>/index.html as an entry point and opens lidar-basic by default on npm run dev.

🛠️ Useful scripts
dev – start the dev server:

bash
Copy code
npm run dev
build – make a production build (outputs to dist/):

bash
Copy code
npm run build
Deploy dist/ to GitHub Pages / Vercel / Netlify.

🔌 Record3D endpoints (Wi-Fi)
The browser uses these endpoints directly on the phone:

GET /metadata → intrinsics and metadata

GET /getOffer → returns { type: "offer", sdp: "..." }

POST /answer → with body { type: "answer", data: "<your SDP>" }

Close any opened browser demo on the phone/desktop: only one WebRTC peer can connect at a time.

🧪 Troubleshooting
“Failed to fetch / JSON parse error”
You probably typed localhost or left the field blank; use the phone’s IP URL, e.g. http://192.168.x.x.

Nothing happens / no video
Make sure the Record3D red toggle is ON, the app is foregrounded, and the page is served over http:// (not https).

IP changed
Re-check the IP on the phone’s Wi-Fi Streaming screen and reconnect.

Performance
Increase “Step” to downsample the point cloud. For big gains, move decoding & projection to GPU shaders (see ideas below).

🧠 Ideas & extensions
Shader pipeline: hue→depth in a fragment shader, XYZ in a vertex shader (huge speed-up)

OrbitControls: use three/examples/jsm/controls/OrbitControls.js

Recording: capture the WebGL canvas with MediaRecorder

Post-processing: add bloom, DOF, CRT, etc. via EffectComposer

Gallery: auto-index all sketches at / with thumbnails
