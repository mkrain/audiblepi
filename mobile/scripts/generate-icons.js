/* eslint-env node */
/**
 * Generates launcher icons from the AudiblePi brand art.
 *
 * Source: mobile/assets/images/Pi.Glow.png (glowing pi on near-black).
 * Run: `node scripts/generate-icons.js` from the mobile/ directory.
 *
 * Outputs (committed):
 * - android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/
 *     ic_launcher.png + ic_launcher_round.png
 * - ios/AudiblePi/Images.xcassets/AppIcon.appiconset/ (all sizes + Contents.json)
 *
 * To regenerate with different art, point ICON_SRC at a new file and re-run.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ICON_SRC = path.join(ROOT, 'assets', 'images', 'Pi.Glow.png');
// Sampled from the source art's corners (near-black, fully opaque).
const PAD_COLOR = { r: 7, g: 0, b: 20, alpha: 1 };

const ANDROID_DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// [filename, pixelSize, idiom, scale, sizePt]
const IOS_ICONS = [
  ['icon-1024.png', 1024, 'ios-marketing', '1x', '1024x1024'],
  ['icon-180.png', 180, 'iphone', '3x', '60x60'],
  ['icon-120.png', 120, 'iphone', '2x', '60x60'],
  ['icon-167.png', 167, 'ipad', '2x', '83.5x83.5'],
  ['icon-152.png', 152, 'ipad', '2x', '76x76'],
  ['icon-87.png', 87, 'iphone', '3x', '29x29'],
  ['icon-80.png', 80, 'iphone', '2x', '40x40'],
  ['icon-60.png', 60, 'iphone', '3x', '20x20'],
  ['icon-58.png', 58, 'iphone', '2x', '29x29'],
  ['icon-40.png', 40, 'iphone', '2x', '20x20'],
];

async function masterIcon() {
  // Pad to a square on the sampled background, then upscale once to 1024
  // with high-quality resampling. All outputs derive from this master so
  // sizes stay consistent.
  return sharp(ICON_SRC)
    .resize(249, 249, {
      fit: 'contain',
      background: PAD_COLOR,
    })
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
}

async function circularMask(size) {
  // White circle on transparent: used as a destination-in mask for round icons.
  const svg =
    `<svg width="${size}" height="${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateAndroid(master) {
  for (const [density, size] of Object.entries(ANDROID_DENSITIES)) {
    const dir = path.join(
      ROOT,
      'android',
      'app',
      'src',
      'main',
      'res',
      density,
    );
    fs.mkdirSync(dir, { recursive: true });

    const square = await sharp(master)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), square);

    const mask = await circularMask(size);
    const round = await sharp(square)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), round);

    console.log(`android ${density}: ic_launcher.png + ic_launcher_round.png (${size}px)`);
  }
}

async function generateIos(master) {
  const setDir = path.join(
    ROOT,
    'ios',
    'AudiblePi',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  fs.mkdirSync(setDir, { recursive: true });

  const images = [];
  for (const [filename, size, idiom, scale, sizePt] of IOS_ICONS) {
    const out = await sharp(master)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(setDir, filename), out);
    images.push({ idiom, scale, size: sizePt, filename });
    console.log(`ios AppIcon: ${filename} (${size}px)`);
  }

  const contents = {
    images,
    info: { version: 1, author: 'xcode' },
  };
  fs.writeFileSync(
    path.join(setDir, 'Contents.json'),
    JSON.stringify(contents, null, 2) + '\n',
  );
}

async function main() {
  if (!fs.existsSync(ICON_SRC)) {
    throw new Error(`Icon source not found: ${ICON_SRC}`);
  }
  const master = await masterIcon();
  await generateAndroid(master);
  await generateIos(master);
  console.log('Done. Review the outputs, then commit.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
