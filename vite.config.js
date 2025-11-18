import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

// dynamically find all sketches
const sketchesDir = "sketches";
const sketches = fs
  .readdirSync(sketchesDir)
  .filter((d) => fs.existsSync(`${sketchesDir}/${d}/index.html`))
  .map((d) => [d, resolve(__dirname, `${sketchesDir}/${d}/index.html`)]);

export default defineConfig({
  root: ".", // allow running any sub-entry
  build: { rollupOptions: { input: Object.fromEntries(sketches) } },
  server: { open: "/sketches/lidar-basic/index.html", port: 5173 },
});
