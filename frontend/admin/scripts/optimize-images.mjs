// Optimize the oversized images in the admin public/ folder (login screen).
//
// Usage (from frontend/admin):
//   npm i -D sharp
//   node scripts/optimize-images.mjs
//
// Non-destructive: originals are copied to public/.img-backup/ before overwrite.
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');
const BACKUP = path.join(PUBLIC, '.img-backup');

const JOBS = [
  { file: 'auth-bull-wide.png', maxW: 1920, quality: 78 },
  { file: 'logo.png', maxW: 512, quality: 82 },
  { file: 'images/bull4x_logo.jpeg', maxW: 256, quality: 82 },
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
    try { await fs.access(backupPath); } catch { await fs.writeFile(backupPath, orig); }

    const img = sharp(orig).resize({ width: maxW, withoutEnlargement: true });
    const out = /\.png$/i.test(file)
      ? await img.png({ quality, compressionLevel: 9, palette: true }).toBuffer()
      : await img.jpeg({ quality, mozjpeg: true }).toBuffer();

    const finalBuf = out.length < orig.length ? out : orig;
    await fs.writeFile(src, finalBuf);
    before += orig.length;
    after += finalBuf.length;
    console.log(`${file}: ${kb(orig.length)} -> ${kb(finalBuf.length)}`);
  }

  console.log(`\nTOTAL: ${kb(before)} -> ${kb(after)}  (saved ${kb(before - after)})`);
  console.log('Originals backed up in public/.img-backup/. Rebuild the admin image after this.');
}

run().catch((e) => { console.error(e); process.exit(1); });
