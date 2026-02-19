/**
 * compose-image.js — Overlay text on background image with 6 visual formats
 * ORGANIC aesthetic — looks like phone screenshots, not graphic design
 * NOTES | CHAT | CHECKLIST | DIAGNOSTICO | MINIMAL | TAROT
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Register fonts
const fontsDir = path.join(__dirname, '..', 'fonts');
registerFont(path.join(fontsDir, 'Montserrat-Bold.ttf'), { family: 'Montserrat', weight: 'bold' });
registerFont(path.join(fontsDir, 'Montserrat-ExtraBold.ttf'), { family: 'Montserrat', weight: '800' });

const WIDTH = 1080;
const HEIGHT = 1920;

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const para of (text || '').split('\n')) {
    if (!para.trim()) { lines.push(''); continue; }
    let current = '';
    for (const word of para.split(' ')) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════════
// NOTES — iPhone Notes app screenshot
// ═══════════════════════════════════════════════
function composeNotes(ctx, td) {
  // Full cream/yellow background like iOS Notes
  ctx.fillStyle = '#FFF8DC';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // iOS status bar area (subtle gray)
  ctx.fillStyle = '#F5F0D0';
  ctx.fillRect(0, 0, WIDTH, 90);
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'right';
  ctx.fillText('9:41', WIDTH - 40, 60);
  ctx.textAlign = 'left';

  // Notes header bar
  ctx.fillStyle = '#F5EFC8';
  ctx.fillRect(0, 90, WIDTH, 80);
  ctx.font = 'bold 32px Montserrat';
  ctx.fillStyle = '#C7A030';
  ctx.fillText('< Notas', 30, 142);
  ctx.textAlign = 'right';
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = '#C7A030';
  ctx.fillText('Listo', WIDTH - 30, 142);
  ctx.textAlign = 'left';

  // Lined paper effect
  ctx.strokeStyle = 'rgba(200, 185, 140, 0.3)';
  ctx.lineWidth = 1;
  for (let y = 230; y < HEIGHT - 100; y += 52) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(WIDTH - 60, y);
    ctx.stroke();
  }

  const leftMargin = 70;
  const maxW = WIDTH - 140;
  let y = 270;

  // Hook as title — bold, left-aligned, like someone typed it
  ctx.font = '800 48px Montserrat';
  ctx.fillStyle = '#1a1a1a';
  const hookLines = wrapText(ctx, td.hook, maxW);
  for (const line of hookLines) {
    ctx.fillText(line, leftMargin, y);
    y += 60;
  }
  y += 25;

  // Dolor — slightly smaller, gray
  ctx.font = 'bold 36px Montserrat';
  ctx.fillStyle = '#444';
  const dolorLines = wrapText(ctx, td.dolor, maxW);
  for (const line of dolorLines) {
    ctx.fillText(line, leftMargin, y);
    y += 48;
  }
  y += 30;

  // Explicación — darker, like emphasis
  ctx.font = 'bold 34px Montserrat';
  ctx.fillStyle = '#6B5B00';
  const expLines = wrapText(ctx, td.explicacion, maxW);
  for (const line of expLines) {
    ctx.fillText(line, leftMargin, y);
    y += 46;
  }
  y += 30;

  // Acción — green, actionable
  ctx.font = 'bold 34px Montserrat';
  ctx.fillStyle = '#2D6A2D';
  const actLines = wrapText(ctx, '> ' + td.accion, maxW);
  for (const line of actLines) {
    ctx.fillText(line, leftMargin, y);
    y += 46;
  }
  y += 50;

  // CTA at bottom — subtle, like a note to self
  ctx.font = 'bold 30px Montserrat';
  ctx.fillStyle = '#aaa';
  ctx.fillText(td.cta, leftMargin, Math.max(y, HEIGHT - 250));

  // Watermark very subtle
  ctx.font = 'bold 22px Montserrat';
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.textAlign = 'center';
  ctx.fillText(td.watermark, WIDTH / 2, HEIGHT - 60);
}

// ═══════════════════════════════════════════════
// CHAT — WhatsApp screenshot style
// ═══════════════════════════════════════════════
function composeChat(ctx, td) {
  // WhatsApp dark background
  ctx.fillStyle = '#0B141A';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle wallpaper pattern (tiny dots)
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let i = 0; i < 200; i++) {
    ctx.fillRect(Math.random() * WIDTH, Math.random() * HEIGHT, 2, 2);
  }

  // Top bar
  ctx.fillStyle = '#1F2C34';
  ctx.fillRect(0, 0, WIDTH, 130);

  // Profile circle
  ctx.beginPath();
  ctx.arc(75, 65, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#2A3942';
  ctx.fill();
  ctx.font = 'bold 24px Montserrat';
  ctx.fillStyle = '#8696A0';
  ctx.textAlign = 'center';
  ctx.fillText('★', 75, 73);

  // Contact name
  ctx.textAlign = 'left';
  ctx.font = 'bold 34px Montserrat';
  ctx.fillStyle = '#E9EDEF';
  ctx.fillText('tu mejor amiga', 120, 58);
  ctx.font = 'bold 24px Montserrat';
  ctx.fillStyle = '#8696A0';
  ctx.fillText('en línea', 120, 92);

  // Time + status bar
  ctx.textAlign = 'right';
  ctx.font = 'bold 24px Montserrat';
  ctx.fillStyle = '#8696A0';
  ctx.fillText('3:42 PM', WIDTH - 30, 45);
  ctx.textAlign = 'left';

  let y = 200;
  const maxBubbleW = WIDTH - 250;

  function drawBubble(text, isRight, time) {
    ctx.font = 'bold 32px Montserrat';
    const lines = wrapText(ctx, text, maxBubbleW - 50);
    const lineH = 42;
    const bubbleH = lines.length * lineH + 45;
    const bubbleW = Math.min(maxBubbleW, Math.max(...lines.map(l => ctx.measureText(l).width)) + 60);

    const bx = isRight ? WIDTH - 50 - bubbleW : 50;
    const color = isRight ? '#005C4B' : '#1F2C34';

    // Bubble
    roundRect(ctx, bx, y, bubbleW, bubbleH, 12);
    ctx.fillStyle = color;
    ctx.fill();

    // Text
    ctx.fillStyle = '#E9EDEF';
    ctx.textAlign = 'left';
    let ty = y + 38;
    for (const line of lines) {
      ctx.fillText(line, bx + 20, ty);
      ty += lineH;
    }

    // Timestamp inside bubble
    ctx.font = 'bold 20px Montserrat';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'right';
    ctx.fillText(time, bx + bubbleW - 15, y + bubbleH - 12);
    ctx.textAlign = 'left';

    y += bubbleH + 18;
  }

  // Conversation flow
  drawBubble(td.dolor, false, '3:42 PM');
  y += 8;
  drawBubble(td.hook, true, '3:43 PM');
  y += 8;
  drawBubble(td.explicacion, false, '3:43 PM');
  y += 8;
  drawBubble(td.accion, true, '3:44 PM');
  y += 8;
  drawBubble(td.cta, false, '3:44 PM');

  // Input bar at bottom
  ctx.fillStyle = '#1F2C34';
  ctx.fillRect(0, HEIGHT - 100, WIDTH, 100);
  roundRect(ctx, 20, HEIGHT - 85, WIDTH - 120, 65, 30);
  ctx.fillStyle = '#2A3942';
  ctx.fill();
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = '#8696A0';
  ctx.textAlign = 'left';
  ctx.fillText('Mensaje', 50, HEIGHT - 44);

  // Mic icon placeholder
  ctx.beginPath();
  ctx.arc(WIDTH - 55, HEIGHT - 52, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#00A884';
  ctx.fill();

  // Watermark
  ctx.font = 'bold 20px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.textAlign = 'center';
  ctx.fillText(td.watermark, WIDTH / 2, HEIGHT - 115);
}

// ═══════════════════════════════════════════════
// CHECKLIST — Simple dark TO-DO list
// ═══════════════════════════════════════════════
function composeChecklist(ctx, td) {
  // Clean dark background — no gradient, no sparkles
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const leftMargin = 80;
  const maxW = WIDTH - 160;
  ctx.textAlign = 'left';

  // Hook as title
  ctx.font = '800 50px Montserrat';
  ctx.fillStyle = '#ffffff';
  let y = 300;
  const hookLines = wrapText(ctx, td.hook, maxW);
  for (const line of hookLines) {
    ctx.fillText(line, leftMargin, y);
    y += 64;
  }

  // Simple thin line separator
  y += 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftMargin, y);
  ctx.lineTo(WIDTH - leftMargin, y);
  ctx.stroke();
  y += 45;

  // Build checklist items
  const items = [td.dolor, td.explicacion, td.accion];
  if (td.textoEnPantalla) {
    const txt = Array.isArray(td.textoEnPantalla) ? td.textoEnPantalla.join('\n') : String(td.textoEnPantalla);
    const extra = txt.split('\n').filter(l => l.trim());
    items.push(...extra.slice(0, 2));
  }

  // Alternate checked/unchecked for realism
  const checks = ['✓', '✓', '☐', '✓', '☐'];

  for (let i = 0; i < items.length; i++) {
    if (!items[i]) continue;
    const isChecked = checks[i] === '✓';

    // Checkbox
    ctx.font = 'bold 38px Montserrat';
    ctx.fillStyle = isChecked ? '#4CAF50' : 'rgba(255,255,255,0.3)';
    ctx.fillText(checks[i] || '☐', leftMargin, y);

    // Text
    ctx.font = 'bold 34px Montserrat';
    ctx.fillStyle = isChecked ? '#ffffff' : 'rgba(255,255,255,0.5)';
    const itemLines = wrapText(ctx, items[i], maxW - 60);
    for (const line of itemLines) {
      ctx.fillText(line, leftMargin + 55, y);
      y += 46;
    }
    y += 28;
  }

  // CTA — subtle at bottom
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'left';
  ctx.fillText(td.cta, leftMargin, Math.max(y + 60, HEIGHT - 220));

  // Watermark
  ctx.font = 'bold 20px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.textAlign = 'center';
  ctx.fillText(td.watermark, WIDTH / 2, HEIGHT - 60);
}

// ═══════════════════════════════════════════════
// DIAGNOSTICO — Clinical "test result" card
// ═══════════════════════════════════════════════
function composeDiagnostico(ctx, td) {
  // Off-white / light background — clinical feel
  ctx.fillStyle = '#F5F5F0';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const leftMargin = 70;
  const maxW = WIDTH - 140;
  ctx.textAlign = 'left';

  // Top label — like a form header
  ctx.font = 'bold 26px Montserrat';
  ctx.fillStyle = '#999';
  let y = 200;
  ctx.fillText('RESULTADO', leftMargin, y);
  y += 15;
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftMargin, y);
  ctx.lineTo(WIDTH - leftMargin, y);
  ctx.stroke();
  y += 50;

  // Hook as main title
  ctx.font = '800 48px Montserrat';
  ctx.fillStyle = '#1a1a1a';
  const hookLines = wrapText(ctx, td.hook, maxW);
  for (const line of hookLines) {
    ctx.fillText(line, leftMargin, y);
    y += 62;
  }
  y += 50;

  // SÍNTOMA box
  function drawSection(label, text, labelColor, bgColor, yPos) {
    // Label
    ctx.font = 'bold 24px Montserrat';
    ctx.fillStyle = labelColor;
    ctx.fillText(label, leftMargin, yPos);
    yPos += 15;

    // Light background box
    const boxH = 110;
    roundRect(ctx, leftMargin, yPos, maxW, boxH, 8);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Text inside
    ctx.font = 'bold 34px Montserrat';
    ctx.fillStyle = '#333';
    const lines = wrapText(ctx, text, maxW - 40);
    let ty = yPos + 42;
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, leftMargin + 20, ty);
      ty += 44;
    }

    return yPos + boxH;
  }

  y = drawSection('SÍNTOMA', td.dolor, '#CC3333', 'rgba(204,51,51,0.06)', y);

  // Arrow
  y += 10;
  ctx.font = 'bold 36px Montserrat';
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'center';
  ctx.fillText('↓', WIDTH / 2, y + 25);
  ctx.textAlign = 'left';
  y += 50;

  y = drawSection('CAUSA', td.explicacion, '#CC8800', 'rgba(204,136,0,0.06)', y);

  // Arrow
  y += 10;
  ctx.font = 'bold 36px Montserrat';
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'center';
  ctx.fillText('↓', WIDTH / 2, y + 25);
  ctx.textAlign = 'left';
  y += 50;

  y = drawSection('ACCIÓN', td.accion, '#338833', 'rgba(51,136,51,0.06)', y);

  // CTA at bottom
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'left';
  ctx.fillText(td.cta, leftMargin, Math.max(y + 80, HEIGHT - 200));

  // Watermark
  ctx.font = 'bold 20px Montserrat';
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.textAlign = 'center';
  ctx.fillText(td.watermark, WIDTH / 2, HEIGHT - 60);
}

// ═══════════════════════════════════════════════
// MINIMAL — 1 bold phrase, black background, nothing else
// ═══════════════════════════════════════════════
function composeMinimal(ctx, td) {
  // Pure black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const centerX = WIDTH / 2;
  ctx.textAlign = 'center';

  // Main hook — BIG, white, centered
  ctx.font = '800 68px Montserrat';
  ctx.fillStyle = '#ffffff';
  const hookLines = wrapText(ctx, td.hook, WIDTH - 160);
  const totalH = hookLines.length * 85;
  let y = (HEIGHT / 2) - (totalH / 2) + 30;
  for (const line of hookLines) {
    ctx.fillText(line, centerX, y);
    y += 85;
  }

  // Dolor underneath — smaller, gray
  y += 30;
  ctx.font = 'bold 34px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  const dolorLines = wrapText(ctx, td.dolor, WIDTH - 200);
  for (const line of dolorLines) {
    ctx.fillText(line, centerX, y);
    y += 46;
  }

  // CTA at very bottom — barely visible
  ctx.font = 'bold 26px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText(td.cta, centerX, HEIGHT - 150);

  // Watermark
  ctx.font = 'bold 20px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillText(td.watermark, centerX, HEIGHT - 60);
}

// ═══════════════════════════════════════════════
// TAROT — Pick-a-card with 3 columns
// ═══════════════════════════════════════════════
function composeTarot(ctx, td) {
  // Dark muted background — not flashy
  ctx.fillStyle = '#1A1520';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const centerX = WIDTH / 2;
  ctx.textAlign = 'center';

  // Hook as title
  ctx.font = '800 46px Montserrat';
  ctx.fillStyle = '#E8DDD0';
  let y = 280;
  const hookLines = wrapText(ctx, td.hook, WIDTH - 140);
  for (const line of hookLines) {
    ctx.fillText(line, centerX, y);
    y += 60;
  }

  // "Elige 1, 2 o 3"
  y += 20;
  ctx.font = 'bold 30px Montserrat';
  ctx.fillStyle = 'rgba(232,221,208,0.5)';
  ctx.fillText('Elige 1, 2 o 3', centerX, y);
  y += 70;

  // 3 card columns
  const cardW = 280;
  const cardH = 420;
  const gap = 30;
  const startX = (WIDTH - (cardW * 3 + gap * 2)) / 2;

  // Use dolor, explicacion, accion as 3 card contents
  const cards = [
    { num: '1', text: td.dolor },
    { num: '2', text: td.explicacion },
    { num: '3', text: td.accion },
  ];

  const cardColors = ['#2A2235', '#252030', '#2A2235'];

  for (let i = 0; i < 3; i++) {
    const cx = startX + i * (cardW + gap);

    // Card background
    roundRect(ctx, cx, y, cardW, cardH, 14);
    ctx.fillStyle = cardColors[i];
    ctx.fill();

    // Card border — subtle
    roundRect(ctx, cx, y, cardW, cardH, 14);
    ctx.strokeStyle = 'rgba(232,221,208,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Number
    ctx.font = '800 72px Montserrat';
    ctx.fillStyle = 'rgba(232,221,208,0.25)';
    ctx.textAlign = 'center';
    ctx.fillText(cards[i].num, cx + cardW / 2, y + 80);

    // Card text
    ctx.font = 'bold 28px Montserrat';
    ctx.fillStyle = '#E8DDD0';
    const cardLines = wrapText(ctx, cards[i].text, cardW - 40);
    let ty = y + 140;
    for (const line of cardLines.slice(0, 5)) {
      ctx.fillText(line, cx + cardW / 2, ty);
      ty += 38;
    }
  }

  // CTA below cards
  const ctaY = y + cardH + 70;
  ctx.font = 'bold 28px Montserrat';
  ctx.fillStyle = 'rgba(232,221,208,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText(td.cta, centerX, ctaY);

  // Watermark
  ctx.font = 'bold 20px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillText(td.watermark, centerX, HEIGHT - 60);
}

// ═══════════════════════════════════════════════
// MAIN — Route to format, NO background image for organic feel
// ═══════════════════════════════════════════════
async function composeImage(bgImagePath, textData, outputPath) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // For organic formats (NOTES, CHAT, CHECKLIST, DIAGNOSTICO, MINIMAL),
  // we DON'T use the FLUX background — each format draws its own bg.
  // Only TAROT uses its own dark bg too.
  const formato = (textData.formato || 'MINIMAL').toUpperCase();

  switch (formato) {
    case 'NOTES':
      composeNotes(ctx, textData);
      break;
    case 'CHAT':
      composeChat(ctx, textData);
      break;
    case 'CHECKLIST':
      composeChecklist(ctx, textData);
      break;
    case 'DIAGNOSTICO':
      composeDiagnostico(ctx, textData);
      break;
    case 'MINIMAL':
      composeMinimal(ctx, textData);
      break;
    case 'TAROT':
      composeTarot(ctx, textData);
      break;
    default:
      composeMinimal(ctx, textData);
      break;
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✅ Composed [${formato}] image saved (${(buffer.length / 1024).toFixed(0)}KB)`);
  return outputPath;
}

module.exports = { composeImage };
