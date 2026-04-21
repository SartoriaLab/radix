const sharp = require('sharp');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(ROOT, 'assets', 'img', 'logo.webp');
const OUT_DIR = path.join(ROOT, 'assets', 'img');

// Logo is 931x268 with X orb on the left. Crop the leftmost square (orb only).
const CROP = { left: 20, top: 0, width: 300, height: 268 };

async function makeFavicon(size, outPath) {
  await sharp(LOGO)
    .extract(CROP)
    .resize({ width: size, height: size, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log('wrote', outPath);
}

(async () => {
  await makeFavicon(48, path.join(OUT_DIR, 'favicon-48.webp'));
  await makeFavicon(96, path.join(OUT_DIR, 'favicon-96.webp'));
  await makeFavicon(192, path.join(OUT_DIR, 'favicon-192.webp'));
  await makeFavicon(512, path.join(OUT_DIR, 'favicon-512.webp'));
  await makeFavicon(180, path.join(OUT_DIR, 'apple-touch-icon.webp'));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
