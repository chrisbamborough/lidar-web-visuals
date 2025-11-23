import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const sketchesDir = "sketches";
const sketches = fs
  .readdirSync(sketchesDir)
  .filter((d) => fs.existsSync(`${sketchesDir}/${d}/index.html`))
  .map((d) => [d, resolve(__dirname, `${sketchesDir}/${d}/index.html`)]);

let openPath = "/sketches/lidar-basic/index.html"; // default

// Use environment variable if set
if (
  process.env.SKETCH &&
  fs.existsSync(`sketches/${process.env.SKETCH}/index.html`)
) {
  openPath = `/sketches/${process.env.SKETCH}/index.html`;
}

export default defineConfig({
  root: ".",
  build: { rollupOptions: { input: Object.fromEntries(sketches) } },
  server: { open: openPath, port: 5173 },
});
