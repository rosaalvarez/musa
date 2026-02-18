/**
 * astro-data.js — Real astronomical data: moon phases, transits, retrogrades
 */

const MOON_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

const ZODIAC_SIGNS = [
  { name: 'Aries', emoji: '♈', element: 'Fuego', dates: [321, 419] },
  { name: 'Tauro', emoji: '♉', element: 'Tierra', dates: [420, 520] },
  { name: 'Géminis', emoji: '♊', element: 'Aire', dates: [521, 620] },
  { name: 'Cáncer', emoji: '♋', element: 'Agua', dates: [621, 722] },
  { name: 'Leo', emoji: '♌', element: 'Fuego', dates: [723, 822] },
  { name: 'Virgo', emoji: '♍', element: 'Tierra', dates: [823, 922] },
  { name: 'Libra', emoji: '♎', element: 'Aire', dates: [923, 1022] },
  { name: 'Escorpio', emoji: '♏', element: 'Agua', dates: [1023, 1121] },
  { name: 'Sagitario', emoji: '♐', element: 'Fuego', dates: [1122, 1221] },
  { name: 'Capricornio', emoji: '♑', element: 'Tierra', dates: [1222, 119] },
  { name: 'Acuario', emoji: '♒', element: 'Aire', dates: [120, 218] },
  { name: 'Piscis', emoji: '♓', element: 'Agua', dates: [219, 320] },
];

// Known retrograde periods 2025-2026
const RETROGRADES = {
  mercury: [
    { start: '2025-03-15', end: '2025-04-07' },
    { start: '2025-07-18', end: '2025-08-11' },
    { start: '2025-11-09', end: '2025-11-29' },
    { start: '2026-03-02', end: '2026-03-25' },
    { start: '2026-07-02', end: '2026-07-26' },
    { start: '2026-10-24', end: '2026-11-13' },
  ],
  venus: [
    { start: '2025-03-02', end: '2025-04-13' },
    { start: '2026-10-03', end: '2026-11-14' },
  ],
  mars: [
    { start: '2024-12-06', end: '2025-02-24' },
    { start: '2027-01-10', end: '2027-04-01' },
  ],
};

const TAROT_MAJOR = [
  { name: 'El Loco', num: 0, meaning: 'Nuevos comienzos, aventura, libertad' },
  { name: 'El Mago', num: 1, meaning: 'Manifestación, poder personal, acción' },
  { name: 'La Sacerdotisa', num: 2, meaning: 'Intuición, misterio, sabiduría interior' },
  { name: 'La Emperatriz', num: 3, meaning: 'Abundancia, fertilidad, amor maternal' },
  { name: 'El Emperador', num: 4, meaning: 'Estructura, autoridad, estabilidad' },
  { name: 'El Hierofante', num: 5, meaning: 'Tradición, guía espiritual, enseñanza' },
  { name: 'Los Enamorados', num: 6, meaning: 'Amor, decisiones del corazón, unión' },
  { name: 'El Carro', num: 7, meaning: 'Victoria, determinación, avance' },
  { name: 'La Fuerza', num: 8, meaning: 'Coraje interior, paciencia, dominio' },
  { name: 'El Ermitaño', num: 9, meaning: 'Introspección, soledad, búsqueda interior' },
  { name: 'La Rueda de la Fortuna', num: 10, meaning: 'Cambios, ciclos, destino' },
  { name: 'La Justicia', num: 11, meaning: 'Equilibrio, verdad, consecuencias' },
  { name: 'El Colgado', num: 12, meaning: 'Sacrificio, nueva perspectiva, soltar' },
  { name: 'La Muerte', num: 13, meaning: 'Transformación, fin de un ciclo, renacimiento' },
  { name: 'La Templanza', num: 14, meaning: 'Equilibrio, paciencia, armonía' },
  { name: 'El Diablo', num: 15, meaning: 'Tentación, ataduras, sombras' },
  { name: 'La Torre', num: 16, meaning: 'Cambio repentino, revelación, destrucción' },
  { name: 'La Estrella', num: 17, meaning: 'Esperanza, inspiración, renovación' },
  { name: 'La Luna', num: 18, meaning: 'Ilusiones, intuición, lo oculto' },
  { name: 'El Sol', num: 19, meaning: 'Éxito, alegría, vitalidad' },
  { name: 'El Juicio', num: 20, meaning: 'Despertar, renacimiento, llamado' },
  { name: 'El Mundo', num: 21, meaning: 'Completitud, logro, plenitud' },
];

/**
 * Calculate moon phase using synodic month algorithm
 * Returns phase name and percentage illumination
 */
function getMoonPhase(date = new Date()) {
  // Known new moon: Jan 6, 2000 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867; // days

  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentCycle = daysSinceKnown / synodicMonth;
  const phase = currentCycle - Math.floor(currentCycle); // 0 to 1

  const dayInCycle = phase * synodicMonth;
  let phaseName, phaseEmoji, illumination;

  if (dayInCycle < 1.85) {
    phaseName = 'Luna Nueva'; phaseEmoji = '🌑'; illumination = 0;
  } else if (dayInCycle < 7.38) {
    phaseName = 'Luna Creciente'; phaseEmoji = '🌒'; illumination = 25;
  } else if (dayInCycle < 9.23) {
    phaseName = 'Cuarto Creciente'; phaseEmoji = '🌓'; illumination = 50;
  } else if (dayInCycle < 14.77) {
    phaseName = 'Gibosa Creciente'; phaseEmoji = '🌔'; illumination = 75;
  } else if (dayInCycle < 16.61) {
    phaseName = 'Luna Llena'; phaseEmoji = '🌕'; illumination = 100;
  } else if (dayInCycle < 22.15) {
    phaseName = 'Gibosa Menguante'; phaseEmoji = '🌖'; illumination = 75;
  } else if (dayInCycle < 24.00) {
    phaseName = 'Cuarto Menguante'; phaseEmoji = '🌗'; illumination = 50;
  } else {
    phaseName = 'Luna Menguante'; phaseEmoji = '🌘'; illumination = 25;
  }

  // Approximate moon sign (changes every ~2.5 days)
  const moonSignIndex = Math.floor((dayInCycle / synodicMonth) * 12) % 12;
  const moonSign = MOON_SIGNS[moonSignIndex];

  return { phaseName, phaseEmoji, illumination, dayInCycle, moonSign };
}

/**
 * Check retrograde status for a given date
 */
function getRetrogrades(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const active = {};

  for (const [planet, periods] of Object.entries(RETROGRADES)) {
    for (const period of periods) {
      if (dateStr >= period.start && dateStr <= period.end) {
        active[planet] = period;
        break;
      }
    }
  }

  return active;
}

/**
 * Get current sun sign based on date
 */
function getSunSign(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateNum = month * 100 + day;

  // Special case for Capricornio spanning year boundary
  if (dateNum >= 1222 || dateNum <= 119) return ZODIAC_SIGNS[9];

  for (const sign of ZODIAC_SIGNS) {
    if (dateNum >= sign.dates[0] && dateNum <= sign.dates[1]) return sign;
  }
  return ZODIAC_SIGNS[9]; // fallback
}

/**
 * Get random zodiac sign
 */
function getRandomSign() {
  return ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)];
}

/**
 * Get two different random signs for vs content
 */
function getTwoSigns() {
  const i = Math.floor(Math.random() * 12);
  let j = Math.floor(Math.random() * 11);
  if (j >= i) j++;
  return [ZODIAC_SIGNS[i], ZODIAC_SIGNS[j]];
}

/**
 * Get random tarot card
 */
function getRandomTarotCard() {
  return TAROT_MAJOR[Math.floor(Math.random() * TAROT_MAJOR.length)];
}

/**
 * Get full astro data for today
 */
function getTodayAstroData(date = new Date()) {
  const moon = getMoonPhase(date);
  const retrogrades = getRetrogrades(date);
  const sunSign = getSunSign(date);
  const retrogradeList = Object.keys(retrogrades);

  let energy;
  if (retrogradeList.includes('mercury')) {
    energy = 'Caótica — Mercurio retrógrado trae confusión en comunicación y decisiones';
  } else if (moon.phaseName === 'Luna Llena') {
    energy = 'Intensa — La Luna Llena amplifica emociones y revelaciones';
  } else if (moon.phaseName === 'Luna Nueva') {
    energy = 'De siembra — Luna Nueva perfecta para manifestar intenciones';
  } else if (retrogradeList.includes('venus')) {
    energy = 'Nostálgica — Venus retrógrado trae recuerdos de amores pasados';
  } else {
    const energies = [
      'De introspección — buen día para escuchar tu intuición',
      'De acción — la energía cósmica te impulsa hacia adelante',
      'De sanación — el universo te pide soltar lo que ya no sirve',
      'De abundancia — alineación favorable para manifestar prosperidad',
    ];
    // Use day of year as seed for consistency within a day
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    energy = energies[dayOfYear % energies.length];
  }

  return {
    date: date.toISOString().split('T')[0],
    moon,
    retrogrades,
    retrogradeList,
    sunSign,
    energy,
  };
}

module.exports = {
  getMoonPhase,
  getRetrogrades,
  getSunSign,
  getRandomSign,
  getTwoSigns,
  getRandomTarotCard,
  getTodayAstroData,
  ZODIAC_SIGNS,
  TAROT_MAJOR,
};
