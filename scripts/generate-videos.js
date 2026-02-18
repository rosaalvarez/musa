/**
 * generate-videos.js — Generate video using Replicate (WAN 2.2 T2V Fast)
 * Generates 1 video per day to keep costs ~$1-3/month
 */

const fs = require('fs');
const path = require('path');
const Replicate = require('replicate');

const VIDEO_PROMPTS = [
  'A glowing tarot card slowly rotating in a mystical purple void, golden particles swirling around it, ethereal smoke, cinematic lighting, dark magical atmosphere',
  'A crystal ball illuminating with purple and gold light in a dark mystical room, stars appearing inside, smoke wisps, enchanting atmosphere',
  'Golden zodiac wheel spinning slowly against a deep purple cosmic background, stars and nebula, mystical energy pulses, cinematic',
  'A mystical moon phases sequence, full moon glowing gold transitioning through phases, purple cosmic background, ethereal particles floating',
  'Tarot cards spreading across a velvet purple table one by one, golden edges catching candlelight, smoke curling, mystical ambiance',
  'A golden sun and silver moon orbiting each other in cosmic purple space, creating mystical energy trails, stars twinkling, ethereal',
  'Purple crystals growing and glowing with inner golden light, mystical energy emanating, dark background, cinematic slow motion',
  'An ornate golden hourglass with cosmic purple sand falling, stars visible inside, mystical atmosphere, slow cinematic movement',
  'A mystical feminine silhouette surrounded by zodiac constellations in gold against deep purple, energy radiating outward, ethereal',
  'Ancient tarot symbols appearing one by one in golden light against purple darkness, magical sparkles, mystical and cinematic',
];

function getVideoPrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return VIDEO_PROMPTS[dayOfYear % VIDEO_PROMPTS.length];
}

async function generateVideo(outputDir) {
  const videoDir = path.join(outputDir, 'video-1');
  fs.mkdirSync(videoDir, { recursive: true });

  const videoPath = path.join(videoDir, 'video.mp4');

  // Skip if already generated today
  if (fs.existsSync(videoPath)) {
    console.log('  ⏭️  Video already exists, skipping');
    return videoPath;
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const prompt = getVideoPrompt();

  console.log(`  🎬 Prompt: ${prompt.substring(0, 80)}...`);
  console.log('  ⏳ Generating video (this may take 2-5 minutes)...');

  try {
    const output = await replicate.run('wan-video/wan-2.2-t2v-fast', {
      input: {
        prompt: prompt,
        num_frames: 81,       // minimum allowed — ~5 seconds, minimal cost
        resolution: '480p',   // keep costs low
      },
    });

    // output can be a FileOutput object, URL string, or array
    let videoUrl = String(output);  // FileOutput.toString() gives URL
    if (Array.isArray(output)) videoUrl = String(output[0]);

    if (videoUrl.startsWith('http')) {
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(videoPath, buffer);
      console.log(`  ✅ Video saved: ${videoPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
      return videoPath;
    }

    // If it's a stream/buffer directly
    if (Buffer.isBuffer(videoUrl)) {
      fs.writeFileSync(videoPath, videoUrl);
      console.log(`  ✅ Video saved: ${videoPath}`);
      return videoPath;
    }

    throw new Error('Unexpected output format from Replicate');
  } catch (error) {
    console.error(`  ❌ Video error: ${error.message}`);
    // Save prompt for manual generation
    fs.writeFileSync(path.join(videoDir, 'prompt.txt'), prompt);
    console.log('  📝 Prompt saved for manual retry');
    return null;
  }
}

module.exports = { generateVideo, getVideoPrompt };
