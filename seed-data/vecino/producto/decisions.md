# Decisions & Architecture — Vecino / Producto

### [2026-02-13 00:00] cap-175
- **Type**: assertion
- **Content**: Línea editorial Vecino: LIBERTARIA. Petro es target principal.

### [2026-02-13 00:00] cap-176
- **Type**: concept
- **Content**: Pipeline Vecino: Scout ($0) → Analysis ($0) → Redaction (~$0.02) → Caricature (~$0.04) → Publisher ($0). Total: ~$0.06/artículo.

### [2026-02-15 00:00] cap-177
- **Type**: assertion
- **Content**: GPT Image (gpt-4o) para imágenes (~$0.04/img). Estilo: Ligne Claire. DALL-E 3 inutilizable para contenido político.

### [2026-02-15 00:00] cap-178
- **Type**: assertion
- **Content**: Categorías Vecino: Rosca, Billete, Circo, Violencia (solo 4). Display via displayCategory() en código.

### [2026-02-15 00:00] cap-179
- **Type**: assertion
- **Content**: 19 artículos publicados. vecino.co dominio configurado. Vercel + Neon PostgreSQL.

### [2026-02-20 00:00] cap-180
- **Type**: concept
- **Content**: X Scraping: OpenClaw browser tool + gateway /tools/invoke. Lista Pro-Col (ID: 1925562984073396709, 57 miembros, @perrodeatelier).

### [2026-02-21 00:00] cap-181
- **Type**: concept
- **Content**: Parser tweets reescrito: extrae de article HTML attribute, expandShowMoreButtons(), fix retweets + single quotes.

### [2026-02-06 00:00] cap-182
- **Type**: assertion
- **Content**: X migró a pay-per-use: $0.005/tweet. Para Vecino ~$7.50/mes. Decisión pendiente: API vs seguir scraping.

### [2026-02-14 00:00] cap-183
- **Type**: assertion
- **Content**: ComfyUI abandonado (Python 3.9 incompatible Mac M4). Solución: GPT Image + Replicate FLUX 2 Pro ($0.025/img backup).

### [2026-02-14 00:00] cap-184
- **Type**: concept
- **Content**: FLUX 2 Pro params: image_reference_strength 0.9, max 3 refs, steps 28, guidance 3.5. NO usar "politician", "corrupt", "caricature of [nombre real]".

### [2026-02-15 00:00] cap-185
- **Type**: assertion
- **Content**: Inline styles + native img en Vecino (no Tailwind dynamic / next Image). Tailwind 4 syntax: @import "tailwindcss".

### [2026-02-15 00:00] cap-186
- **Type**: assertion
- **Content**: DB: tabla articles (lowercase), campo closure NOT NULL.
