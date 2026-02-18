# 🎨 MUSA — Guía Completa del Proyecto

**Última actualización:** Febrero 19, 2026

---

## 📖 HISTORIA: Por qué nació Musa

### El problema
Natala necesita tráfico. Sin usuarios, no hay suscripciones. Rosita tiene capital limitado para Meta Ads, y TikTok Ads es más barato pero aún cuesta. Solución: **contenido orgánico automático**.

### La idea
Crear un generador de contenido que automáticamente produzca 4 posts + 1 video diario sobre tarot/astrología para Instagram y TikTok. El contenido atrae audiencia orgánica → la audiencia descubre Natala → se convierten en usuarios → algunos pagan Premium.

### Decisiones clave
1. **Musa es producto-agnóstico** — no está atada a Natala. Genera contenido de tarot/astrología que sirve para cualquier producto. Si mañana Rosita lanza otro producto espiritual, Musa genera para ese también.
2. **Musa vive independiente** — tiene su propio repo en GitHub, su propia carpeta, sus propios scripts. No depende de Natala para funcionar.
3. **Claude Haiku para texto** (no Sonnet) — más barato, suficiente calidad para posts de redes sociales.
4. **FLUX Schnell para imágenes** (no Gemini) — Gemini free tier se agota rápido. FLUX en Replicate es gratis (modelo community).
5. **WAN 2.2 para videos** — ~$0.05 por video, 1 video/día = ~$1.50/mes.
6. **Todo automático** — corre con OpenClaw cron a las 6am Colombia sin intervención humana.
7. **Dashboard en GitHub Pages** — Rosita puede ver el contenido generado desde su iPhone sin terminal.

---

## 🎯 QUÉ HACE MUSA

Cada día a las 6am Colombia:

1. **Calcula datos astrológicos** del día (fase lunar, retrógrados, signo solar actual)
2. **Elige 4 tipos de contenido** (siempre incluye fase_lunar, el resto varía)
3. **Genera 4 captions** con Claude Haiku (texto en español latino, hooks emocionales)
4. **Genera 4 imágenes** con FLUX Schnell (estilo místico púrpura/dorado)
5. **Genera 1 video** con WAN 2.2 (5 seg, estilo cósmico)
6. **Construye dashboard** HTML con todo lo generado
7. **Guarda todo** en carpeta `output/YYYY-MM-DD/`

### Tipos de contenido
| Tipo | Qué es | Ejemplo de hook |
|------|--------|-----------------|
| `horoscopo` | Horóscopo del día para un signo random | "Leo ♌ hoy el universo te tiene un mensaje..." |
| `carta_del_dia` | Revela una carta de tarot dramáticamente | "La carta que te salió hoy no es coincidencia..." |
| `fase_lunar` | Fase actual + ritual (SIEMPRE incluido) | "Luna Nueva en Piscis ♓ — ritual de intenciones" |
| `dolor_post` | Post emocional tipo "si estás leyendo esto..." | "Si estás leyendo esto, no es casualidad..." |
| `signo_vs_signo` | Compara 2 signos dramáticamente | "Escorpio vs Géminis en el amor 💔" |
| `transitos` | Retrógrados y tránsitos (si hay activos) | "Mercurio retrógrado: lo que NADIE te dice" |

### Distribución de temas
- **60% amor** — ruptura, ex, crush, relaciones, almas gemelas
- **30% dinero** — abundancia, manifestar, deudas, prosperidad
- **10% salud/propósito** — perdido, agotado, sin dirección

### CTAs (se incluyen aleatoriamente en 50% de posts)
- "🔮 Descubre más en natala.online"
- "✨ Pregúntale a Luna → natala.online"
- "🌙 Tu lectura personalizada te espera en natala.online"
- "💫 natala.online — tu guía espiritual"

---

## 🏗️ CÓMO ESTÁ CONSTRUIDO

### Runtime: Node.js (scripts puros, no framework)
No es una app web ni un servidor. Son scripts de Node.js que se ejecutan una vez al día.

### Dependencias
```json
{
  "@anthropic-ai/sdk": "latest",    // Claude Haiku para texto
  "replicate": "latest",            // FLUX Schnell (imágenes) + WAN 2.2 (videos)
  "dotenv": "latest"                // Variables de entorno
}
```

### Carpeta: `/Users/rositaalvarez/.openclaw/workspace/musa/`

```
musa/
├── .env                            # API keys (ver abajo)
├── .env.example                    # Template de .env
├── package.json
├── README.md
│
├── scripts/                        # ⭐ TODOS LOS SCRIPTS
│   ├── generate-content.js         # SCRIPT PRINCIPAL — orquesta todo
│   ├── astro-data.js               # Datos astronómicos del día
│   ├── templates.js                # Templates, hooks, CTAs, hashtags
│   ├── generate-images.js          # Genera imágenes con FLUX Schnell
│   ├── generate-videos.js          # Genera videos con WAN 2.2
│   └── build-dashboard.js          # Construye dashboard HTML
│
├── docs/                           # Dashboard (GitHub Pages)
│   ├── index.html                  # Página web del dashboard
│   ├── data.json                   # Data del último día generado
│   └── assets/                     # Imágenes y videos copiados
│
└── output/                         # Contenido generado (por día)
    └── 2026-02-18/
        ├── post-1/
        │   ├── caption.txt         # Texto del post
        │   ├── hashtags.txt        # Hashtags
        │   └── image.webp          # Imagen generada
        ├── post-2/
        ├── post-3/
        ├── post-4/
        ├── video-1/
        │   ├── video.mp4           # Video generado
        │   └── prompt.txt          # Prompt usado (backup si falla)
        └── summary.json            # Resumen del día
```

---

## 🔧 CÓMO FUNCIONA CADA SCRIPT

### 1. `generate-content.js` (SCRIPT PRINCIPAL)
Este es el que se ejecuta. Hace todo:
1. Carga API keys de `.env`
2. Llama a `getTodayAstroData()` para datos del día
3. Llama a `pickDailyContent()` para elegir 4 tipos
4. Para cada tipo:
   - `buildPrompt()` → genera prompt para Claude
   - `generateCaption()` → llama Claude Haiku → guarda caption.txt
   - `getHashtags()` → genera hashtags → guarda hashtags.txt
   - `buildImagePrompt()` + `generateImage()` → FLUX Schnell → guarda image.webp
5. `generateVideo()` → WAN 2.2 → guarda video.mp4
6. `buildDashboard()` → copia assets a docs/, genera data.json
7. Guarda summary.json con resumen del día

### 2. `astro-data.js` (Datos astrológicos)
- **getMoonPhase(date):** Calcula fase lunar real usando algoritmo sinódico (nueva moon conocida: Jan 6, 2000). Devuelve: nombre de fase, emoji, iluminación, signo lunar.
- **getRetrogrades(date):** Tiene periodos retrógrados hardcodeados 2025-2026 para Mercurio, Venus, Marte. Devuelve cuáles están activos.
- **getSunSign(date):** Signo solar del día actual.
- **getRandomSign():** Signo aleatorio (para posts de horóscopo).
- **getTwoSigns():** Dos signos diferentes (para signo vs signo).
- **getRandomTarotCard():** Carta del Arcano Mayor aleatoria (22 cartas).
- **getTodayAstroData():** Combina todo + calcula "energía del día" (caótica si Mercurio retrógrado, intensa si Luna Llena, etc.)

### 3. `templates.js` (Templates y prompts)
- **pickDailyContent(astroData):** Elige 4 tipos. Siempre `fase_lunar`. Si hay retrógrados, incluye `transitos`. Resto aleatorio.
- **buildPrompt(type, astroData):** Construye prompt para Claude con:
  - Instrucciones base: "Eres astróloga mística latina, Instagram/TikTok, español latino, gancho emocional potente, máx 280 palabras"
  - Contexto astrológico del día
  - Instrucciones específicas por tipo
  - Tema: 60% amor, 30% dinero, 10% salud
  - CTA (50% de probabilidad)
- **buildImagePrompt(type, extras):** Prompt para FLUX: "Mystical dark purple and gold aesthetic..." + variante por tipo
- **getHashtags(type, topic):** Combina sets de hashtags base + específicos

### 4. `generate-images.js` (FLUX Schnell)
- Usa Replicate SDK
- Modelo: `black-forest-labs/flux-schnell` (GRATIS, modelo community)
- Formato: 1:1 (1080x1080), WebP, quality 90
- Output: ReadableStream → Buffer → archivo .webp
- Si falla: log error pero continúa

### 5. `generate-videos.js` (WAN 2.2)
- Usa Replicate SDK
- Modelo: `wan-video/wan-2.2-t2v-fast`
- 10 prompts rotativos (se selecciona por día del año)
- Config: 81 frames (~5 seg), 480p (mínimo costo)
- Costo: ~$0.05 por video
- Si falla: guarda prompt.txt para retry manual
- Skip si ya existe video del día

### 6. `build-dashboard.js` (Dashboard)
- Lee los posts generados del día
- Copia imágenes/videos a `docs/assets/`
- Genera `docs/data.json` con toda la data
- El `docs/index.html` lee data.json y muestra todo bonito
- Se publica en GitHub Pages: rosaalvarez.github.io/musa/

---

## 🔑 VARIABLES DE ENTORNO (.env)

```env
ANTHROPIC_API_KEY=tu-api-key-aqui
GEMINI_API_KEY=AIzaSyBI1io3YexEp-GljXriOHfkHZCm4kQXegY
REPLICATE_API_TOKEN=tu-replicate-token-aqui
```

Nota: GEMINI_API_KEY está ahí pero las imágenes se generan con FLUX (Replicate). Gemini se usó como backup pero tiene rate limit en free tier.

---

## ⏰ AUTOMATIZACIÓN (Cron)

### OpenClaw Cron Job
- **ID:** `23cc84f1-35b3-4595-b05f-a882a78087d9`
- **Nombre:** `musa-content`
- **Schedule:** `0 11 * * * UTC` = 6:00am Colombia todos los días
- **Tipo:** agentTurn (isolated session)
- **Comando:** `cd /Users/rositaalvarez/.openclaw/workspace/musa && node scripts/generate-content.js`
- **Timeout:** 300 segundos (5 min)
- **Delivery:** announce (anuncia resultado a Rosita)

### Ejecución manual
```bash
cd /Users/rositaalvarez/.openclaw/workspace/musa
node scripts/generate-content.js
```

---

## 🖼️ ESTILO DE IMÁGENES

### Estilo base
"Mystical dark purple and gold aesthetic, ethereal glow, magical atmosphere, high quality digital art for social media, Square format 1080x1080"

### Variantes por tipo
- **horoscopo:** Zodiac symbol for [signo] glowing in gold against deep purple cosmic background
- **carta_del_dia:** Single tarot card "[carta]" floating in cosmic purple space, glowing golden edges
- **fase_lunar:** [fase] moon glowing in deep purple night sky, crystals and candles
- **dolor_post:** Broken golden heart floating in cosmic purple space, healing light from cracks
- **signo_vs_signo:** Two zodiac symbols facing each other with lightning, cosmic battle
- **transitos:** Planet Mercury in retrograde motion, swirling golden cosmic trails

---

## ⚠️ PROBLEMA ACTUAL CON LAS IMÁGENES

Rosita identificó un problema crítico: **nadie lee el caption de Instagram/TikTok**. El contenido tiene que estar DENTRO de la imagen.

### Cómo son los posts virales de astrología (ejemplos que Rosita mandó):
1. **Imagen de fondo llamativa** (caballo de fuego, fuegos artificiales, cosmos, atardecer)
2. **Texto GRANDE y bold ENCIMA de la imagen** — el mensaje ES la imagen
3. **Estilo místico/oscuro** — fondos negros, dorados, azules cósmicos
4. **Formato vertical** (1080x1920 para Reels/TikTok)
5. **Hooks emocionales** — "No es casualidad que estés viendo esto", "Conquistar a un Acuario es como..."

### Lo que Musa hace ahora (MAL):
- Genera imagen bonita + caption en texto separado
- La imagen es solo un fondo sin texto
- El caption va aparte → nadie lo lee

### Lo que Musa debería hacer (PENDIENTE):
1. FLUX genera imagen de fondo (cósmico, dramático)
2. Node.js superpone texto grande con fuentes bold usando canvas/sharp
3. Formato 1080x1920 (vertical para Reels/TikTok)
4. Caption solo tiene hashtags

---

## 📊 HASHTAGS

```
Base: #tarot #horoscopo #signoszodiacales #astrologia #tarotdeldia #universo #espiritualidad
Amor: #amor #expareja #almasgemelas #tarotdelamor #relaciones
Dinero: #abundancia #prosperidad #dinero #manifestar #leydelaatraccion
Luna: #lunallena #lunanueva #fasesdeluna #energia #ritual
Signos: #aries #tauro #geminis #cancer #leo #virgo #libra #escorpio #sagitario #capricornio #acuario #piscis
```

Se combinan según tipo de post y tema.

---

## 🗺️ HACIA DÓNDE VA MUSA

### Inmediato (siguiente tarea)
- [ ] **Texto sobre imagen** — el cambio más importante. Generar imagen de fondo + overlay de texto grande
- [ ] **Formato vertical 1080x1920** para Reels/TikTok
- [ ] Quitar Gemini del pipeline, solo FLUX

### Corto plazo
- [ ] **Dashboard mejorado** — que Rosita pueda ver y descargar desde iPhone fácilmente
- [ ] **Multi-producto** — sistema de config para generar contenido de cualquier producto
- [ ] **Posteo automático** — conectar con API de Instagram/TikTok para publicar automáticamente

### Mediano plazo
- [ ] **Videos con texto** — similar a las imágenes, texto sobre video
- [ ] **Variación de formatos** — carruseles, stories, diferentes layouts
- [ ] **A/B testing** — generar variantes y trackear cuál funciona mejor

---

## 📝 NOTAS IMPORTANTES

- Musa ha corrido **una sola vez** (Feb 18, 2026). El cron está configurado pero aún no ha ejecutado automáticamente.
- El output de Feb 18 está en `output/2026-02-18/` con 4 posts + 1 video.
- Las imágenes actuales son genéricas (sin texto encima). Esto es lo URGENTE de arreglar.
- El video se genera pero el modelo WAN 2.2 produce videos abstractos/cósmicos — para contenido real de video, eventualmente se necesitaría algo como Kling AI (pero tiene $0 de balance) o Luma ($10/mo).
- GitHub repo: rosaalvarez/musa — actualmente hay que hacer push manual después de generar.
