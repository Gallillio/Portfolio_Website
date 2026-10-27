import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Pixel size of an image in public/, read from its header when the page is
 * built. The project pages pass it to next/image so the browser reserves the
 * right box before the screenshot loads; a guessed size would make the text
 * below each image jump. Handles PNG and JPEG, which covers every project image.
 */
export function imageSize(src: string): { width: number; height: number } {
  const file = readFileSync(path.join(process.cwd(), "public", src))

  // PNG: the IHDR chunk always comes first, with width and height at bytes 16 and 20.
  if (file.readUInt32BE(0) === 0x89504e47) {
    return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
  }

  // JPEG: walk the segments to the first start-of-frame marker (FFC0 to FFCF,
  // except FFC4, FFC8 and FFCC, which share the range but are not frames).
  if (file.readUInt16BE(0) === 0xffd8) {
    let offset = 2
    while (offset + 9 < file.length) {
      const marker = file.readUInt16BE(offset)
      if (marker >= 0xffc0 && marker <= 0xffcf && ![0xffc4, 0xffc8, 0xffcc].includes(marker)) {
        return { height: file.readUInt16BE(offset + 5), width: file.readUInt16BE(offset + 7) }
      }
      offset += 2 + file.readUInt16BE(offset + 2)
    }
  }

  throw new Error(`imageSize: ${src} is not a PNG or JPEG this function can read`)
}
