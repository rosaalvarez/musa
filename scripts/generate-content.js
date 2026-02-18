#!/usr/bin/env node
/**
 * generate-content.js — Main Musa content generation script
 * Generates 4 daily social media posts about tarot/astrology
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { getTodayAstroData, getRandomSign, getTwoSigns, getRandomTarotCard } = require('./astro-data');
const { pickDailyContent, buildPrompt, buildImagePrompt, getHashtags } = require('./templates');
const { generateImage } = require('./generate-images');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const outputDir = path.join(__dirname, '..', 'output', dateStr);

async function generateCaption(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].text;
}

async function generatePost(type, index, astroData) {
  const postDir = path.join(outputDir, `post-${index + 1}`);
  fs.mkdirSync(postDir, { recursive: true });

  console.log(`\n📝 Post ${index + 1}: ${type}`);

  // Build prompt and generate caption
  const { prompt, topic, extras } = buildPrompt(type, astroData);
  console.log(`  Topic: ${topic}`);

  const caption = await generateCaption(prompt);
  console.log(`  ✅ Caption generated (${caption.length} chars)`);

  // Save caption
  fs.writeFileSync(path.join(postDir, 'caption.txt'), caption);

  // Save hashtags
  const hashtags = getHashtags(type, topic);
  fs.writeFileSync(path.join(postDir, 'hashtags.txt'), hashtags);

  // Generate image
  const imagePrompt = buildImagePrompt(type, {
    sign: extras.sign,
    card: extras.card,
    moonPhase: astroData.moon.phaseName,
  });
  console.log(`  🎨 Generating image...`);
  await generateImage(imagePrompt, path.join(postDir, 'image.png'));

  return { type, topic, caption, hashtags };
}

async function main() {
  console.log('🌙 MUSA — Generador de contenido místico');
  console.log(`📅 Fecha: ${dateStr}`);
  console.log('═'.repeat(50));

  // Get astro data
  const astroData = getTodayAstroData(today);
  console.log(`\n🌕 Luna: ${astroData.moon.phaseName} ${astroData.moon.phaseEmoji} en ${astroData.moon.moonSign}`);
  console.log(`☀️  Sol en: ${astroData.sunSign.name} ${astroData.sunSign.emoji}`);
  if (astroData.retrogradeList.length > 0) {
    console.log(`⚠️  Retrógrados: ${astroData.retrogradeList.join(', ')}`);
  }
  console.log(`✨ Energía: ${astroData.energy}`);

  // Pick content types
  const contentTypes = pickDailyContent(astroData);
  console.log(`\n📋 Posts del día: ${contentTypes.join(', ')}`);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate each post
  const results = [];
  for (let i = 0; i < contentTypes.length; i++) {
    try {
      const result = await generatePost(contentTypes[i], i, astroData);
      results.push(result);
    } catch (error) {
      console.error(`  ❌ Error en post ${i + 1}: ${error.message}`);
    }
  }

  // Save summary
  const summary = {
    date: dateStr,
    astro: {
      moon: astroData.moon,
      sunSign: astroData.sunSign.name,
      retrogrades: astroData.retrogradeList,
      energy: astroData.energy,
    },
    posts: results.map((r, i) => ({
      num: i + 1,
      type: r.type,
      topic: r.topic,
      captionPreview: r.caption.substring(0, 100) + '...',
    })),
  };
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

  // Print results
  console.log('\n' + '═'.repeat(50));
  console.log('✅ CONTENIDO GENERADO');
  console.log('═'.repeat(50));
  for (const r of results) {
    console.log(`\n--- ${r.type.toUpperCase()} (${r.topic}) ---`);
    console.log(r.caption);
    console.log(`\n${r.hashtags}`);
  }

  console.log(`\n📁 Output: ${outputDir}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
