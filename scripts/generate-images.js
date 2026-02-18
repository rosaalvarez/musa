/**
 * generate-images.js — Generate images using Replicate FLUX Schnell (FREE)
 */

const fs = require('fs');
const path = require('path');
const Replicate = require('replicate');

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const IMAGE_STYLES = {
  horoscope: (sign) => `Mystical tarot reading scene, dark purple and gold aesthetic, glowing crescent moon, floating tarot cards with golden borders, sparkles and cosmic dust, text "${sign.toUpperCase()}" in elegant golden serif letters at bottom, square Instagram post, magical ethereal atmosphere, high quality`,
  moon_phase: (phase) => `Ethereal ${phase} moon glowing in dark night sky, purple and indigo clouds, golden light rays, crystals and candles below, mystical ritual scene, dark aesthetic with gold accents, square format, dreamy atmospheric, high quality`,
  dolor: () => `Lonely woman silhouette looking at starry night sky, purple and blue tones, golden moon, emotional melancholic atmosphere, cosmic healing energy, sparkles, tarot cards scattered, dark mystical aesthetic, square Instagram format, cinematic, high quality`,
  signo_vs: (sign1, sign2) => `Two zodiac constellation symbols facing each other in cosmic space, ${sign1} vs ${sign2}, dark purple nebula background, golden energy between them, hearts and lightning bolts, dramatic cosmic battle of love, square format, mystical aesthetic, high quality`,
  carta: (card) => `Single mystical tarot card "${card}" glowing with golden light, floating in dark purple cosmic void, sparkles and stardust around it, ornate golden frame, ethereal mist, magical atmosphere, square Instagram post, high quality`,
  ritual: () => `Mystical altar with lit candles, crystals, sage smoke, moonlight streaming in, purple and gold tones, peaceful spiritual energy, tarot deck nearby, dark aesthetic, square format, atmospheric, high quality`,
};

async function generateImage(prompt, outputPath) {
  try {
    console.log(`  📸 Generating image...`);
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: '1:1',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 90,
      }
    });

    if (output && output[0]) {
      const stream = output[0];
      // Handle ReadableStream
      const chunks = [];
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, buf);
      console.log(`  ✅ Image saved (${(buf.length / 1024).toFixed(0)}KB)`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`  ❌ Image generation failed:`, err.message);
    return false;
  }
}

module.exports = { generateImage, IMAGE_STYLES };
