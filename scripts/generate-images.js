/**
 * generate-images.js — Generate images using Gemini API
 */

const fs = require('fs');

/**
 * Generate image using gemini-2.0-flash-exp-image-generation
 */
async function generateImage(prompt, outputPath) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ parts: [{ text: `Generate this image (no text in response, only the image): ${prompt}` }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText.substring(0, 200)}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`  ✅ Image saved: ${outputPath}`);
        return true;
      }
    }

    console.log('  ⚠️  No image data, saving placeholder');
    createPlaceholder(outputPath);
    return false;
  } catch (error) {
    console.error(`  ❌ Image error: ${error.message.substring(0, 150)}`);
    createPlaceholder(outputPath);
    return false;
  }
}

function createPlaceholder(outputPath) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#1a0a2e"/><stop offset="100%" style="stop-color:#3d1a6e"/>
  </linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <text x="540" y="500" text-anchor="middle" fill="#d4af37" font-size="72" font-family="serif">✨🔮✨</text>
  <text x="540" y="600" text-anchor="middle" fill="#d4af37" font-size="36" font-family="serif">natala.online</text>
</svg>`;
  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
}

module.exports = { generateImage };
