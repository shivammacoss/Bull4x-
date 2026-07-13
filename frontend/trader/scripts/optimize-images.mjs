// Optimize the oversized images in public/ that dominate first-load time.
//
// Usage (from frontend/trader):
//   npm i -D sharp
//   node scripts/optimize-images.mjs
//
// Non-destructive: every original is copied to public/.img-backup/ before it
// is overwritten. Re-run is safe (it re-reads the current file). The 9.4 MB
// hero video (bull_video.mp4) is NOT handled here — compress it with ffmpeg:
//   ffmpeg -i public/bull_video.mp4 -vcodec libx264 -crf 28 -preset slow \
//          -an -movflags +faststart public/bull_video.min.mp4
//
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');
const BACKUP = path.join(PUBLIC, '.img-backup');

// file (relative to public/) → max width in px (height auto). Quality is tuned
// per use. Logos/UI art don't need to exceed their real display size.
const JOBS = [
  { file: 'bull4x-logo.png', maxW: 512, quality: 82 },
  { file: 'auth-bull.png', maxW: 1200, quality: 78 },
  { file: 'auth-bull-wide.png', maxW: 1920, quality: 78 },
  { file: 'images/image1.png', maxW: 1600, quality: 78 },
  { file: 'landing/img/banner1.png', maxW: 1600, quality: 78 },
  { file: 'landing/img/banner2.png', maxW: 1600, quality: 78 },
  { file: 'landing/img/banner3.png', maxW: 1600, quality: 78 },
  { file: 'landing/img/logo.png', maxW: 512, quality: 82 },
];

const kb = (n) => (n / 1024).toFixed(0) + ' KB';

async function run() {
  await fs.mkdir(BACKUP, { recursive: true });
  let before = 0, after = 0;

  for (const { file, maxW, quality } of JOBS) {
    const src = path.join(PUBLIC, file);
    let orig;
    try {
      orig = await fs.readFile(src);
    } catch {
      console.log(`skip (not found): ${file}`);
      continue;
    }
    const backupPath = path.join(BACKUP, file);
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    // Only back up once — never clobber the pristine original on re-run.
    try { await fs.access(backupPath); } catch { await fs.writeFile(backupPath, orig); }

    const img = sharp(orig).resize({ width: maxW, withoutEnlargement: true });
    const out = file.endsWith('.png')
      ? await img.png({ quality, compressionLevel: 9, palette: true }).toBuffer()
      : await img.jpeg({ quality, mozjpeg: true }).toBuffer();

    // Guard: never write a version that came out larger.
    const finalBuf = out.length < orig.length ? out : orig;
    await fs.writeFile(src, finalBuf);
    before += orig.length;
    after += finalBuf.length;
    console.log(`${file}: ${kb(orig.length)} -> ${kb(finalBuf.length)}`);
  }

  console.log(`\nTOTAL: ${kb(before)} -> ${kb(after)}  (saved ${kb(before - after)})`);
  console.log('Originals backed up in public/.img-backup/. Rebuild the trader image after this.');
}

run().catch((e) => { console.error(e); process.exit(1); });
