// Writes lib/image-meta.json: the pixel size and a tiny blurred preview of every
// image in a public/ subfolder, which is where the project screenshots and
// diagrams live (the root holds icons and the OG image). The lightbox and the
// image placeholders read it, so a frame can open at the image's real shape,
// showing the blur, before any of the image has arrived.
//
// `npm run build` runs this first, so a deploy never ships stale sizes. Run
// `npm run images:meta` after adding or replacing a screenshot to update the
// committed copy that `next dev` uses.
import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = path.join(root, "public")
const outFile = path.join(root, "lib", "image-meta.json")
const IMAGE = /\.(png|jpe?g|webp)$/i
// Next.js asks for a placeholder of 10px or less; it is enlarged and blurred when shown.
const BLUR_SIZE = 10

async function* imagesIn(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* imagesIn(full)
    else if (IMAGE.test(entry.name)) yield full
  }
}

const meta = {}
for (const entry of await readdir(publicDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  for await (const file of imagesIn(path.join(publicDir, entry.name))) {
    const { width, height } = await sharp(file).metadata()
    const blur = await sharp(file)
      .resize(BLUR_SIZE, BLUR_SIZE, { fit: "inside" })
      .webp({ quality: 60 })
      .toBuffer()
    const src = "/" + path.relative(publicDir, file).split(path.sep).join("/")
    meta[src] = { width, height, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` }
  }
}

// Plain code-point order, so the file comes out the same on every machine.
const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
await writeFile(outFile, JSON.stringify(sorted, null, 2) + "\n")
console.log(`image-meta: wrote ${Object.keys(sorted).length} images to lib/image-meta.json`)
