const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const src = path.join(__dirname, "..", "public", "LogoWD.jpg");
const outDir = path.join(__dirname, "..", "public");

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

if (!fs.existsSync(src)) {
  console.error("Source logo not found:", src);
  process.exit(1);
}

(async () => {
  try {
    for (const size of sizes) {
      const out = path.join(outDir, `icon-${size}x${size}.png`);
      await sharp(src).resize(size, size, { fit: "cover" }).toFile(out);
      console.log("Wrote", out);
    }
    // Create favicon.ico (48x48 while supporting multiple sizes)
    const icoOut = path.join(outDir, "favicon.ico");
    await sharp(src).resize(48, 48).toFile(icoOut);
    console.log("Wrote", icoOut);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
