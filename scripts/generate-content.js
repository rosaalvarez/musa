#!/usr/bin/env node
/**
 * generate-content.js — Musa content generation v2
 * Generates 12 daily pieces using the master prompt
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { getTodayAstroData } = require('./astro-data');
// master-prompt is required inside generatePack()
const { generateImage } = require('./generate-images');
const { composeImage } = require('./compose-image');
const { generateVideo } = require('./generate-videos');
const { buildDashboard } = require('./build-dashboard');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const outputDir = path.join(__dirname, '..', 'output', dateStr);

/**
 * Parse JSON from Claude response with multiple fallbacks
 */
function parseJSON(raw) {
  // Direct parse
  try { return JSON.parse(raw); } catch (e) {}

  // Extract JSON block
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (e) {}
  }

  // Clean markdown fences
  let cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace > 0) cleaned = cleaned.substring(0, lastBrace + 1);
  return JSON.parse(cleaned);
}

/**
 * Call Claude Haiku to generate a batch of pieces
 */
async function generateBatch(prompt, batchLabel) {
  console.log(`🤖 Llamando a Claude Haiku (${batchLabel})...`);
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].text;
}

/**
 * Generate full pack in 2 batches (6+6) to fit within 4096 token limit
 */
async function generatePack(astroData) {
  const { buildMasterPromptBatch1, buildMasterPromptBatch2 } = require('./master-prompt');

  // Batch 1: 6 IG guardables
  const raw1 = await generateBatch(buildMasterPromptBatch1(astroData), 'Batch 1: 6 IG guardables');
  let batch1;
  try {
    batch1 = parseJSON(raw1);
  } catch (e) {
    console.error('  ❌ Error parseando Batch 1:', e.message);
    console.error('  Raw:', raw1.substring(0, 500));
    throw e;
  }

  console.log(`  ✅ Batch 1: ${batch1.pack_diario?.length || 0} piezas`);

  // Small delay between API calls
  await new Promise(r => setTimeout(r, 3000));

  // Batch 2: 4 TikTok/Reels + 2 Stories
  const raw2 = await generateBatch(buildMasterPromptBatch2(astroData), 'Batch 2: 4 videos + 2 stories');
  let batch2;
  try {
    batch2 = parseJSON(raw2);
  } catch (e) {
    console.error('  ❌ Error parseando Batch 2:', e.message);
    console.error('  Raw:', raw2.substring(0, 500));
    throw e;
  }

  console.log(`  ✅ Batch 2: ${batch2.pack_diario?.length || 0} piezas`);

  // Combine
  return {
    fecha: astroData.date,
    app: 'Natala',
    pack_diario: [
      ...(batch1.pack_diario || []),
      ...(batch2.pack_diario || []),
    ],
  };
}

/**
 * Process a single piece: save files + generate images
 */
async function processPiece(pieza, index) {
  const num = String(index + 1).padStart(2, '0');
  const pieceDir = path.join(outputDir, `pieza-${num}`);
  fs.mkdirSync(pieceDir, { recursive: true });

  console.log(`\n📝 Pieza ${num}: [${pieza.canal}] ${pieza.formato_visual} — ${pieza.hook}`);

  // Save metadata
  fs.writeFileSync(path.join(pieceDir, 'metadata.json'), JSON.stringify(pieza, null, 2));

  // Save caption
  if (pieza.caption) {
    fs.writeFileSync(path.join(pieceDir, 'caption.txt'), pieza.caption);
  }

  // Save guion (if video)
  if (pieza.guion_voz) {
    fs.writeFileSync(path.join(pieceDir, 'guion.txt'), pieza.guion_voz);
  }

  // Organic formats render their own backgrounds — skip FLUX for them
  const formato = (pieza.formato_visual || 'MINIMAL').toUpperCase();
  const needsFluxBg = false; // All 6 formats are self-contained now
  let bgPath = null;

  if (needsFluxBg) {
    bgPath = path.join(pieceDir, 'image-bg.webp');
    const imagePrompt = pieza.prompt_imagen || 'mystical dark purple cosmic background, 9:16 vertical format';
    console.log(`  🎨 Generando imagen de fondo...`);
    try {
      await generateImage(imagePrompt, bgPath, pieza.negativa_imagen);
    } catch (err) {
      console.error(`  ❌ Error generando imagen: ${err.message}`);
    }
  } else {
    console.log(`  📱 Formato orgánico [${formato}] — sin FLUX bg`);
  }

  // Compose final image with text overlay
  console.log(`  🖼️ Componiendo imagen final...`);
  const finalPath = path.join(pieceDir, 'image.png');
  try {
    const textData = {
      formato: pieza.formato_visual || 'MINIMAL',
      hook: pieza.hook || '',
      dolor: pieza.dolor || '',
      explicacion: pieza.explicacion_astro || '',
      accion: pieza.accion_hoy || '',
      cta: pieza.CTA_suave || '',
      textoEnPantalla: Array.isArray(pieza.texto_en_pantalla) ? pieza.texto_en_pantalla.join('\n') : (pieza.texto_en_pantalla || ''),
      watermark: 'natala.online',
    };
    await composeImage(bgPath, textData, finalPath);
  } catch (err) {
    console.error(`  ❌ Error componiendo imagen: ${err.message}`);
  }
}

async function main() {
  console.log('🌙 MUSA v2 — Generador de contenido con Prompt Maestro');
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

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate pack with master prompt
  let pack;
  try {
    pack = await generatePack(astroData);
    console.log(`\n✅ Pack recibido: ${pack.pack_diario?.length || 0} piezas`);
  } catch (err) {
    console.error(`\n❌ Error generando pack: ${err.message}`);
    process.exit(1);
  }

  const piezas = pack.pack_diario || [];
  if (piezas.length === 0) {
    console.error('❌ No se generaron piezas');
    process.exit(1);
  }

  // Save full pack
  fs.writeFileSync(path.join(outputDir, 'pack.json'), JSON.stringify(pack, null, 2));

  // Process each piece
  for (let i = 0; i < piezas.length; i++) {
    if (i > 0) {
      // Small delay between pieces (no FLUX calls = no rate limit needed)
      await new Promise(r => setTimeout(r, 500));
    }
    try {
      await processPiece(piezas[i], i);
    } catch (err) {
      console.error(`  ❌ Error en pieza ${i + 1}: ${err.message}`);
    }
  }

  // Save summary
  const summary = {
    date: dateStr,
    version: 'v2-master-prompt',
    astro: {
      moon: astroData.moon,
      sunSign: astroData.sunSign.name,
      retrogrades: astroData.retrogradeList,
      energy: astroData.energy,
    },
    piezas: piezas.map((p, i) => ({
      num: i + 1,
      id: p.id,
      canal: p.canal,
      formato_visual: p.formato_visual,
      pilar: p.pilar,
      hook: p.hook,
    })),
    totalPiezas: piezas.length,
  };
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

  // Print results
  console.log('\n' + '═'.repeat(50));
  console.log('✅ CONTENIDO GENERADO');
  console.log('═'.repeat(50));
  for (const p of piezas) {
    console.log(`  [${p.canal}] ${p.formato_visual} | ${p.pilar} | ${p.hook}`);
  }

  // Generate video (1 per day)
  console.log('\n🎬 Generando video...');
  try {
    await generateVideo(outputDir);
  } catch (error) {
    console.error(`❌ Video error: ${error.message}`);
  }

  // Build dashboard
  console.log('\n📊 Construyendo dashboard...');
  try {
    buildDashboard(dateStr);
  } catch (error) {
    console.error(`❌ Dashboard error: ${error.message}`);
  }

  console.log(`\n📁 Output: ${outputDir}`);
  console.log(`📊 Total piezas: ${piezas.length}`);
  console.log(`🌐 Dashboard: docs/index.html`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
