#!/usr/bin/env node
/**
 * build-dashboard.js — Build dashboard data from today's generated content
 */

const fs = require('fs');
const path = require('path');

const today = new Date().toISOString().split('T')[0];

function buildDashboard(dateStr) {
  dateStr = dateStr || today;
  const outputDir = path.join(__dirname, '..', 'output', dateStr);
  const dashDir = path.join(__dirname, '..', 'dashboard');
  const assetsDir = path.join(dashDir, 'assets');

  fs.mkdirSync(assetsDir, { recursive: true });

  if (!fs.existsSync(outputDir)) {
    console.log(`⚠️  No output found for ${dateStr}`);
    return;
  }

  const data = { date: dateStr, posts: [], video: null };

  // Read summary if exists
  const summaryPath = path.join(outputDir, 'summary.json');
  if (fs.existsSync(summaryPath)) {
    data.summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  }

  // Process posts
  const entries = fs.readdirSync(outputDir).filter(e => e.startsWith('post-')).sort();
  for (const entry of entries) {
    const postDir = path.join(outputDir, entry);
    if (!fs.statSync(postDir).isDirectory()) continue;

    const post = { id: entry };

    // Caption
    const captionPath = path.join(postDir, 'caption.txt');
    if (fs.existsSync(captionPath)) {
      post.caption = fs.readFileSync(captionPath, 'utf-8');
    }

    // Hashtags
    const hashPath = path.join(postDir, 'hashtags.txt');
    if (fs.existsSync(hashPath)) {
      post.hashtags = fs.readFileSync(hashPath, 'utf-8');
    }

    // Image — copy to assets and store relative path
    const imgPath = path.join(postDir, 'image.png');
    const svgPath = path.join(postDir, 'image.svg');
    if (fs.existsSync(imgPath)) {
      const dest = path.join(assetsDir, `${entry}.png`);
      fs.copyFileSync(imgPath, dest);
      post.image = `assets/${entry}.png`;
      // Also base64 for inline display
      post.imageBase64 = 'data:image/png;base64,' + fs.readFileSync(imgPath).toString('base64');
    } else if (fs.existsSync(svgPath)) {
      const dest = path.join(assetsDir, `${entry}.svg`);
      fs.copyFileSync(svgPath, dest);
      post.image = `assets/${entry}.svg`;
    }

    data.posts.push(post);
  }

  // Video
  const videoDir = path.join(outputDir, 'video-1');
  const videoPath = path.join(videoDir, 'video.mp4');
  if (fs.existsSync(videoPath)) {
    const dest = path.join(assetsDir, 'video.mp4');
    fs.copyFileSync(videoPath, dest);
    data.video = { path: 'assets/video.mp4' };
  }
  const promptPath = path.join(videoDir, 'prompt.txt');
  if (fs.existsSync(promptPath)) {
    data.videoPrompt = fs.readFileSync(promptPath, 'utf-8');
  }

  // Write data.json
  fs.writeFileSync(path.join(dashDir, 'data.json'), JSON.stringify(data, null, 2));
  console.log(`✅ Dashboard data built for ${dateStr} (${data.posts.length} posts)`);
}

if (require.main === module) {
  buildDashboard(process.argv[2]);
}

module.exports = { buildDashboard };
