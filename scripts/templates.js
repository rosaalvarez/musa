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
 * Build image prompt for Gemini
 */
function buildImagePrompt(type, extras = {}) {
  const baseStyle = 'Mystical dark purple and gold aesthetic, ethereal glow, magical atmosphere, high quality digital art for social media';

  switch (type) {
    case 'horoscopo':
      return `${baseStyle}. Zodiac symbol for ${extras.sign?.name || 'Aries'} glowing in gold against deep purple cosmic background with stars and nebula. Elegant and mystical. Square format 1080x1080.`;
    case 'carta_del_dia':
      return `${baseStyle}. A single tarot card "${extras.card?.name || 'The Moon'}" floating in cosmic purple space, glowing golden edges, mystical smoke around it, dramatic lighting. Square format 1080x1080.`;
    case 'fase_lunar':
      return `${baseStyle}. ${extras.moonPhase || 'Full moon'} glowing bright in deep purple night sky, surrounded by golden stars, crystals and candles at the bottom, ethereal and magical. Square format 1080x1080.`;
    case 'dolor_post':
      return `${baseStyle}. A broken golden heart floating in cosmic purple space, with healing light emanating from the cracks, stars and cosmic dust surrounding it, emotional and beautiful. Square format 1080x1080.`;
    case 'signo_vs_signo':
      return `${baseStyle}. Two zodiac symbols facing each other with lightning between them, cosmic battle in purple and gold, dramatic and powerful energy. Square format 1080x1080.`;
    case 'transitos':
      return `${baseStyle}. Planet Mercury glowing in retrograde motion path against deep purple cosmos, warning energy, swirling golden cosmic trails, dramatic atmosphere. Square format 1080x1080.`;
    default:
      return `${baseStyle}. Crystal ball glowing with purple and gold light, tarot cards scattered around, mystical smoke, cosmic background. Square format 1080x1080.`;
  }
}

module.exports = {
  CONTENT_TYPES,
  pickDailyContent,
  pickTopic,
  getCTA,
  getHashtags,
  buildPrompt,
  buildImagePrompt,
};
