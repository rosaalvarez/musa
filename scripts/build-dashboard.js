#!/usr/bin/env node
/**
 * build-dashboard.js — Build dashboard data from today's generated content (v2)
 */

const fs = require('fs');
const path = require('path');

const today = new Date().toISOString().split('T')[0];

function buildDashboard(dateStr) {
  dateStr = dateStr || today;
  const outputDir = path.join(__dirname, '..', 'output', dateStr);
  const dashDir = path.join(__dirname, '..', 'docs');
  const assetsDir = path.join(dashDir, 'assets');

  fs.mkdirSync(assetsDir, { recursive: true });

  if (!fs.existsSync(outputDir)) {
    console.log(`⚠️  No output found for ${dateStr}`);
    return;
  }

  const data = { date: dateStr, piezas: [], video: null };

  // Read summary if exists
  const summaryPath = path.join(outputDir, 'summary.json');
  if (fs.existsSync(summaryPath)) {
    data.summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  }

  // Read pack if exists
  const packPath = path.join(outputDir, 'pack.json');
  if (fs.existsSync(packPath)) {
    data.pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  }

  // Process piezas (new structure: pieza-01, pieza-02, etc.)
  const entries = fs.readdirSync(outputDir)
    .filter(e => e.startsWith('pieza-') || e.startsWith('post-'))
    .sort();

  for (const entry of entries) {
    const pieceDir = path.join(outputDir, entry);
    if (!fs.statSync(pieceDir).isDirectory()) continue;

    const piece = { id: entry };

    // Metadata
    const metaPath = path.join(pieceDir, 'metadata.json');
    if (fs.existsSync(metaPath)) {
      piece.metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }

    // Caption
    const captionPath = path.join(pieceDir, 'caption.txt');
    if (fs.existsSync(captionPath)) {
      piece.caption = fs.readFileSync(captionPath, 'utf-8');
    }

    // Hashtags
    const hashPath = path.join(pieceDir, 'hashtags.txt');
    if (fs.existsSync(hashPath)) {
      piece.hashtags = fs.readFileSync(hashPath, 'utf-8');
    }

    // Guion
    const guionPath = path.join(pieceDir, 'guion.txt');
    if (fs.existsSync(guionPath)) {
      piece.guion = fs.readFileSync(guionPath, 'utf-8');
    }

    // Final image
    const imgPath = path.join(pieceDir, 'image.png');
    if (fs.existsSync(imgPath)) {
      const dest = path.join(assetsDir, `${entry}.png`);
      fs.copyFileSync(imgPath, dest);
      piece.image = `assets/${entry}.png`;
    }

    data.piezas.push(piece);
  }

  // Video
  const videoDir = path.join(outputDir, 'video-1');
  const videoPath = path.join(videoDir, 'video.mp4');
  if (fs.existsSync(videoPath)) {
    const dest = path.join(assetsDir, 'video.mp4');
    fs.copyFileSync(videoPath, dest);
    data.video = { path: 'assets/video.mp4' };
  }

  // Write data.json
  fs.writeFileSync(path.join(dashDir, 'data.json'), JSON.stringify(data, null, 2));
  console.log(`✅ Dashboard data built for ${dateStr} (${data.piezas.length} piezas)`);
}

if (require.main === module) {
  buildDashboard(process.argv[2]);
}

module.exports = { buildDashboard };
