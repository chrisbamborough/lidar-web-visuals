# LiDAR Web Visuals (Record3D → WebRTC → Three.js)

Live, browser-based visuals using iPhone/iPad LiDAR via the **Record3D** app.  
This repo uses **Vite** + **Three.js (ES Modules)** and a “sketch-per-folder” workflow for fast creative iterations.

## ✨ What you can do

- Connect directly to the iPhone’s **Wi-Fi WebRTC** stream (no server needed)
- Decode **HSV-encoded depth** and render a **point cloud** with Three.js
- Create a new visual by copying a sketch folder and editing `main.js`

---

## 🧱 Project structure

lidar-web-visuals/
├─ package.json
├─ vite.config.js
├─ public/
│ └─ assets/ # optional shared assets
└─ sketches/
├─ lidar-basic/
│ ├─ index.html
│ ├─ main.js
│ └─ style.css
└─ <your-next-sketch>/
├─ index.html
├─ main.js
└─ style.css

Each folder in `sketches/` is a self-contained “sketch” (like p5/Processing).

---

## 🚀 Quick start

1. **Install**

```bash
npm install
```

2. Run the dev server

bash
Copy code
npm run dev
Vite prints a URL (e.g. http://localhost:5173/).

Open a sketch
Visit http://localhost:5173/sketches/lidar-basic/ (or any other sketch folder).

On your iPhone/iPad

Open the Record3D app → Wi-Fi Streaming

Turn the red toggle ON and leave the screen awake

Note the IP, e.g. http://192.168.86.28

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
