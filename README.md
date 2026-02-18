# 🌙 Musa — Generador de Contenido Místico

Automated daily content generator for TikTok/Instagram. Creates 3-4 daily posts about tarot, astrology, horoscopes, and mystical content for the **Natala** brand.

## Quick Start

```bash
npm install
cp .env.example .env  # Add your API keys
node scripts/generate-content.js
```

## Content Types
- 🔮 Horóscopo del día
- 🃏 Carta del día (tarot)
- 🌕 Fase lunar
- 💔 Dolor post (emotional hooks)
- ⚡ Signo vs Signo
- ⚠️ Tránsitos planetarios

## Stack
- **Claude Haiku** — text generation
- **Gemini 2.0 Flash** — image generation
- **GitHub Actions** — daily automation at 6am COT

Output goes to `output/YYYY-MM-DD/`.
