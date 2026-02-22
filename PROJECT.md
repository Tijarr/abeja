# Abeja.co — Documentación del Proyecto

**Última actualización**: 2026-02-22
**Status**: MVP en construcción
**Repositorio**: pendiente (GitHub)
**Deploy**: https://abeja-viewer.vercel.app (viewer estático actual)

---

## Qué es Abeja

**Diseñador de contextos.** Sistema que captura, clasifica y organiza información para que humanos e IAs puedan consumirla eficientemente.

**No es**: app de notas, task manager, Notion clone.
**Sí es**: sistema nervioso para materializar visiones → conceptos → prototipos → productos → operaciones.

---

## Origen

Angel Tijaro tuvo una agencia digital (Designó, 500+ proyectos). Con IA, puede hacer solo lo que antes requería un equipo de 20. Abeja es el sistema que soporta esa nueva realidad: captura todo lo que piensa, lo organiza, y permite que agentes IA lo consuman y ejecuten.

Primer pedido explícito: 6 de enero 2026 — "Enviar un mensaje y que lo clasifique como Tarea, Idea o Reflexión y lo meta dentro de un bucket."

---

## Arquitectura

### Stack
- **Frontend**: Next.js (Vercel)
- **Database**: Neon PostgreSQL (cloud)
- **Auth**: simple token o password
- **Canal principal**: Telegram/WhatsApp → API → Abeja
- **Web**: dashboard para visualizar, no para capturar

### Taxonomía

```
Domain (tema/mundo)
  └── Space (contexto específico — creación u operación)
       └── Capture (unidad atómica de información)
            ├── type: task | idea | assertion | reflection | reference | concept | routine
            ├── content: texto libre
            ├── metadata: date, source, status, confidence, frequency
            └── connections: related captures
```

### Domains actuales (7)
| Domain | Spaces | Vault |
|--------|--------|-------|
| Finca | pajarillo, legal | no |
| Vecino | editorial, producto, republica-malandra | no |
| Canticuento | cuentos, producto | no |
| Personal | crecimiento, maximas | 🔒 sí |
| Familia | hijos, hogar | no |
| Abeja | diseño, meta | no |
| Sandbox | ideas | no |

### Tipos de captura (7)
| Tipo | Qué es |
|------|--------|
| task | Algo que hacer, con posible dueño y deadline |
| idea | Semilla de producto/proyecto, sin compromiso |
| assertion | Facto, creencia, máxima, principio |
| reflection | Proceso interno, emocional (VAULT, nunca sale) |
| reference | Link, recurso, material externo |
| concept | Idea elaborada para proyecto existente |
| routine | Tarea recurrente con frecuencia definida |

### Skills transversales
- **Capture**: clasifica y almacena capturas
- **Curator**: refina metadata automáticamente (futuro)
- **Router**: determina domain + space de un input (futuro)

---

## Principios de diseño

1. **Iteración sin fricción** — si es complejo de usar, falla
2. **Captura vía conversación** — no formularios
3. **El sistema organiza, no el humano**
4. **Assertions construyen contexto** — factos atómicos, no documentos
5. **Event sourcing** — todo trazable (quién, cuándo, por qué)
6. **Skills transversales** — superpoderes que cruzan todos los domains
7. **Todo tiende a automatización** — "¿cómo automatizo este contexto?"
8. **VAULT** — reflections personales nunca salen
9. **Preguntar antes de actuar** — si falta info crítica, preguntar (no inventar)
10. **100% valor capturado por Angel** — sin intermediarios, sin dilución

---

## Reglas de captura

### Incomplete Task Rule
1. **Info crítica faltante** → preguntar (¿a quién? ¿qué documento?)
2. **Info inferible** → actuar e informar ("Lo puse en Finca/Legal. ¿Correcto?")
3. **Info irrelevante** → usar defaults, no preguntar

### Routing
- Si domain claro → clasificar directo
- Si ambiguo → Sandbox
- Si aparece 2+ veces en Sandbox → proponer promoción a domain
- Reflections → siempre Personal/crecimiento (VAULT)

---

## Roadmap

### MVP (en construcción)
- [x] Skill de captura (abeja-capture)
- [x] Estructura de domains y spaces
- [x] 204 capturas migradas de WhatsApp
- [x] Viewer web con auth (Vercel)
- [ ] App Next.js standalone con Neon PostgreSQL
- [ ] API de captura (POST /api/capture)
- [ ] Integración Telegram (webhook)
- [ ] Rutinas automatizadas (cron)

### Post-MVP
- [ ] Curator skill (metadata automática)
- [ ] Router inteligente (mejora clasificación con contexto)
- [ ] Assertions engine (factos atómicos con metadata)
- [ ] Consultas cruzadas entre domains
- [ ] Dashboard visual (no captura, solo visualización)
- [ ] Automatizaciones por space

---

## Datos actuales

- **204 capturas** organizadas
- **7 domains**, **14 spaces**
- **Fuentes**: WhatsApp self-chat (14 meses) + conversaciones TijaroBot
- **Periodo cubierto**: Dic 2024 — Feb 2026

---

## Historia del proyecto

Documentación detallada en:
- `memory/topics/abeja-genesis.md` — visión fundacional, historia personal, patrones
- `memory/topics/abeja-project.md` — arquitectura técnica detallada
- `memory/topics/abeja-raw-captures-analysis.md` — análisis de capturas
