/**
 * templates.js — Content templates, hooks, CTAs, and hashtags
 */

const CONTENT_TYPES = [
  'horoscopo',
  'carta_del_dia',
  'fase_lunar',
  'dolor_post',
  'signo_vs_signo',
  'transitos',
];

/**
 * Pick 4 content types for today, always including fase_lunar.
 * If retrogrades active, include transitos.
 */
function pickDailyContent(astroData) {
  const picks = ['fase_lunar']; // always include
  const pool = [...CONTENT_TYPES].filter(t => t !== 'fase_lunar');

  if (astroData.retrogradeList.length > 0) {
    picks.push('transitos');
    pool.splice(pool.indexOf('transitos'), 1);
  }

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  while (picks.length < 4) {
    picks.push(pool.shift());
  }

  // Shuffle final order
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }

  return picks;
}

const TOPIC_WEIGHTS = { amor: 0.6, dinero: 0.3, salud: 0.1 };

function pickTopic() {
  const r = Math.random();
  if (r < 0.6) return 'amor';
  if (r < 0.9) return 'dinero';
  return 'salud y propósito';
}

const CTA_VARIANTS = [
  '🔮 Descubre más en natala.online',
  '✨ Pregúntale a Luna → natala.online',
  '🌙 Tu lectura personalizada te espera en natala.online',
  '💫 natala.online — tu guía espiritual',
];

function getCTA() {
  return CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)];
}

const HASHTAG_SETS = {
  base: '#tarot #horoscopo #signoszodiacales #astrologia #tarotdeldia #universo #espiritualidad',
  amor: '#amor #expareja #almasgemelas #tarotdelamor #relaciones',
  dinero: '#abundancia #prosperidad #dinero #manifestar #leydelaatraccion',
  luna: '#lunallena #lunanueva #fasesdeluna #energia #ritual',
  signos: '#aries #tauro #geminis #cancer #leo #virgo #libra #escorpio #sagitario #capricornio #acuario #piscis',
};

function getHashtags(type, topic) {
  let tags = HASHTAG_SETS.base;
  if (topic === 'amor') tags += ' ' + HASHTAG_SETS.amor;
  if (topic === 'dinero') tags += ' ' + HASHTAG_SETS.dinero;
  if (type === 'fase_lunar') tags += ' ' + HASHTAG_SETS.luna;
  if (type === 'horoscopo' || type === 'signo_vs_signo') tags += ' ' + HASHTAG_SETS.signos;
  return tags;
}

/**
 * Build prompt for Claude Haiku based on content type
 */
function buildPrompt(type, astroData, extras = {}) {
  const topic = extras.topic || pickTopic();
  const includeCTA = Math.random() < 0.5;
  const cta = includeCTA ? getCTA() : null;

  const baseInstruction = `Eres una astróloga y tarotista mística latina. Escribes contenido para Instagram/TikTok en español latino.
REGLAS:
- La PRIMERA LÍNEA debe ser un gancho emocional potente que detenga el scroll
- Tono: místico, empático, dramático pero auténtico
- Tema principal: ${topic}
- NO uses inglés
- Máximo 280 palabras
- Usa emojis con moderación (3-5 por post)
${cta ? `- Termina con este CTA sutil: "${cta}"` : '- NO incluyas llamada a la acción al final'}
${astroData.moon ? `- Fase lunar actual: ${astroData.moon.phaseName} ${astroData.moon.phaseEmoji} en ${astroData.moon.moonSign}` : ''}
${astroData.retrogradeList.length > 0 ? `- Planetas retrógrados: ${astroData.retrogradeList.join(', ')}` : ''}
- Energía del día: ${astroData.energy}`;

  let specificPrompt;

  switch (type) {
    case 'horoscopo': {
      const sign = extras.sign || require('./astro-data').getRandomSign();
      specificPrompt = `Escribe el horóscopo del día para ${sign.name} ${sign.emoji} (elemento: ${sign.element}).
Incluye predicciones sobre ${topic}. Sé específico y dramático.
Formato: Gancho → Predicción → Consejo cósmico`;
      extras.sign = sign;
      break;
    }
    case 'carta_del_dia': {
      const card = extras.card || require('./astro-data').getRandomTarotCard();
      specificPrompt = `La carta del día es: "${card.name}" (Arcano ${card.num}).
Significado base: ${card.meaning}.
Escribe un post revelando esta carta dramáticamente, como si le hablaras a alguien que necesita este mensaje.
Formato: "La carta que te salió hoy..." → Revelación → Interpretación para ${topic}`;
      extras.card = card;
      break;
    }
    case 'fase_lunar': {
      specificPrompt = `La fase lunar actual es: ${astroData.moon.phaseName} ${astroData.moon.phaseEmoji} en ${astroData.moon.moonSign}.
Escribe qué significa esta fase para ${topic}.
Incluye un mini ritual o acción que pueden hacer hoy.
Formato: Gancho emocional → Significado → Ritual/Acción`;
      break;
    }
    case 'dolor_post': {
      specificPrompt = `Escribe un post emocional tipo "dolor" sobre ${topic === 'amor' ? 'una ruptura, un amor que se fue, o alguien que te hizo daño' : topic === 'dinero' ? 'la frustración de no tener suficiente, deudas, o sentir que no mereces abundancia' : 'sentirte perdido/a, sin propósito, agotado/a emocionalmente'}.
El tono debe ser como si el universo le hablara directamente a esa persona que está sufriendo.
Empieza con algo como "Si estás leyendo esto, no es casualidad..."
Formato: Gancho de dolor → Validación → Mensaje del universo → Esperanza`;
      break;
    }
    case 'signo_vs_signo': {
      const [s1, s2] = extras.signs || require('./astro-data').getTwoSigns();
      specificPrompt = `Escribe un post comparando ${s1.name} ${s1.emoji} vs ${s2.name} ${s2.emoji} en ${topic === 'amor' ? 'el amor' : topic === 'dinero' ? 'el dinero' : 'la vida'}.
Sé dramático y divertido. Incluye características de cada signo.
Formato: "${s1.name} vs ${s2.name} 💔" → Comparación → Veredicto cósmico`;
      extras.signs = [s1, s2];
      break;
    }
    case 'transitos': {
      const planets = astroData.retrogradeList.length > 0
        ? astroData.retrogradeList.join(' y ') + ' retrógrado'
        : 'los tránsitos planetarios actuales';
      specificPrompt = `Escribe sobre ${planets} y cómo afecta ${topic}.
Sé dramático con las advertencias pero termina con esperanza.
Formato: Advertencia dramática → Qué significa → Cómo sobrevivir`;
      break;
    }
  }

  return {
    prompt: `${baseInstruction}\n\n${specificPrompt}`,
    topic,
    includeCTA,
    cta,
    extras,
  };
}

/**
 * Build background image prompt for FLUX (9:16 vertical, NO text)
 * These are JUST backgrounds — text gets overlaid by compose-image.js
 */
function buildImagePrompt(type, extras = {}) {
  const baseStyle = 'Dark mystical background, no text, no words, no letters, no writing, cinematic lighting, high quality digital art, vertical portrait orientation';

  // Varied background pools for each type
  const bgVariants = {
    horoscopo: [
      `${baseStyle}. Cosmic galaxy with golden nebula and bright stars, deep space, dark blue and purple tones, ethereal glow`,
      `${baseStyle}. Mystical fire horse galloping through dark cosmos, golden flames, sparks and embers, epic dramatic`,
      `${baseStyle}. Dark night sky with aurora borealis in purple and gold, mountains silhouette, magical atmosphere`,
      `${baseStyle}. Golden zodiac wheel spinning in dark cosmic void, glowing constellations, mystical energy`,
      `${baseStyle}. Dramatic sunset over dark ocean, golden and purple clouds, mystical spiritual atmosphere`,
    ],
    carta_del_dia: [
      `${baseStyle}. Mystical dark altar with glowing candles, purple smoke, golden light rays from above, tarot aesthetic`,
      `${baseStyle}. Dark cosmic void with golden dust particles floating, single beam of divine light, mystical`,
      `${baseStyle}. Crystal cave with purple amethyst crystals glowing, golden light reflections, magical underground`,
      `${baseStyle}. Dark forest at night with fireflies and golden moonlight filtering through trees, enchanted`,
    ],
    fase_lunar: [
      `${baseStyle}. Giant ${extras.moonPhase || 'full moon'} over dark ocean, golden reflection on water, mystical clouds`,
      `${baseStyle}. ${extras.moonPhase || 'Full moon'} in dark purple sky surrounded by golden sparkles and cosmic dust`,
      `${baseStyle}. Dark night ritual scene, moonlight illuminating crystals and candles, purple and gold tones`,
      `${baseStyle}. Massive moon rising behind dark mountain, golden light, stars, cosmic atmosphere`,
    ],
    dolor_post: [
      `${baseStyle}. Dark stormy sky breaking into golden light, dramatic clouds, hope emerging from darkness`,
      `${baseStyle}. Silhouette of person standing before vast cosmic galaxy, golden stars, emotional cinematic`,
      `${baseStyle}. Dark ocean waves with golden bioluminescence, dramatic sky, emotional atmosphere`,
      `${baseStyle}. Phoenix rising from dark ashes with golden fire, rebirth, dramatic cosmic background`,
    ],
    signo_vs_signo: [
      `${baseStyle}. Two opposing cosmic energies colliding, fire and ice, gold and purple, dramatic explosion`,
      `${baseStyle}. Lightning storm in dark cosmic space, golden and purple energy clashing, dramatic power`,
      `${baseStyle}. Dark cosmic arena with two nebulae facing each other, golden sparks between them`,
    ],
    transitos: [
      `${baseStyle}. Planets aligned in dark cosmic space, golden orbital trails, cosmic geometry, dramatic`,
      `${baseStyle}. Dark cosmic storm with swirling golden energy, planets in retrograde, dramatic atmosphere`,
      `${baseStyle}. Cosmic vortex in deep space, dark purple and gold, swirling star trails, dramatic`,
    ],
  };

  const variants = bgVariants[type] || bgVariants.horoscopo;
  return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Build the SHORT text that goes INSIDE the image (max 3-4 lines, hook potente)
 * Returns { headline, bodyLines, signName, signEmoji }
 */
function buildImageText(type, extras = {}, astroData = {}) {
  let headline = '';
  let bodyLines = [];
  let signName = null;
  let signEmoji = null;

  switch (type) {
    case 'horoscopo': {
      const sign = extras.sign;
      signName = sign?.name || 'Aries';
      signEmoji = sign?.emoji || '♈';
      const hooks = [
        'El universo tiene un mensaje para ti hoy',
        'Lo que viene para ti nadie lo espera',
        'Hoy todo cambia para ti',
        'No ignores esta señal',
        'El cosmos habla, ¿estás escuchando?',
      ];
      headline = hooks[Math.floor(Math.random() * hooks.length)];
      break;
    }
    case 'carta_del_dia': {
      const card = extras.card;
      headline = 'Tu carta del día no es coincidencia';
      bodyLines = [card?.name || 'El Loco'];
      break;
    }
    case 'fase_lunar': {
      const moon = astroData.moon || {};
      signEmoji = moon.phaseEmoji || '🌙';
      headline = `${moon.phaseName || 'Luna Nueva'}`;
      bodyLines = [
        `en ${moon.moonSign || 'Piscis'}`,
        'Lo que hagas hoy define tu mes entero',
      ];
      break;
    }
    case 'dolor_post': {
      const dolorHooks = [
        'Si estás leyendo esto,\nno es casualidad',
        'El universo te puso\neste mensaje por algo',
        'Esto es para ti,\naunque no lo creas',
        'Lo que perdiste\nva a volver multiplicado',
      ];
      headline = dolorHooks[Math.floor(Math.random() * dolorHooks.length)];
      break;
    }
    case 'signo_vs_signo': {
      const [s1, s2] = extras.signs || [{ name: 'Escorpio', emoji: '♏' }, { name: 'Géminis', emoji: '♊' }];
      headline = `${s1.name} ${s1.emoji} vs ${s2.name} ${s2.emoji}`;
      bodyLines = ['¿Quién gana en el amor?'];
      break;
    }
    case 'transitos': {
      const planets = astroData.retrogradeList?.length > 0
        ? astroData.retrogradeList.join(' y ')
        : 'Mercurio';
      headline = `${planets} Retrógrado`;
      bodyLines = ['Lo que NADIE te dice'];
      break;
    }
    default:
      headline = 'El universo tiene un mensaje para ti';
  }

  return { headline, bodyLines, signName, signEmoji, watermark: 'natala.online' };
}

module.exports = {
  CONTENT_TYPES,
  pickDailyContent,
  pickTopic,
  getCTA,
  getHashtags,
  buildPrompt,
  buildImagePrompt,
  buildImageText,
};
