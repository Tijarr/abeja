# Abeja — Context

**Ultima actualizacion**: 2026-02-24
**Para**: el builder (IA en Cursor que construye el software)

---

## Que es Abeja

Tablero de control. Angel se sienta, ve el estado de todos sus proyectos, decide que hacer, y luego va a la estacion correcta a ejecutar.

**No es** un second brain, no es un task manager, no es donde se construye software ni donde se operan productos. Es donde se piensa y se decide.

---

## Los tres sombreros

Angel opera en tres modos. Cada modo tiene su propia interfaz y su propio estado mental. Cambiar de interfaz ayuda al cambio de sombrero.

```
PENSAR (Abeja)          CONSTRUIR (Fabrica)         OPERAR (cada producto)
-------------------     ---------------------       ----------------------
que hay que hacer?      como se construye?          como van las vacas?
que falta?              PRD, UX, codigo, deploy     reportes, crons, dia a dia
que decido?             tweaks, iteracion           usuarios, datos reales

Interfaz: Abeja web     Interfaz: Cursor/IDE        Interfaz: cada app
Frecuencia: diario      Frecuencia: por proyecto    Frecuencia: operativa
```

### Abeja (pensar)

Tablero donde Angel ve el estado de todo. Tasks por proyecto, contexto acumulado, contactos, decisiones pendientes. Es rapido, es un vistazo. No se construye aqui.

### Fabrica (construir)

Hoy es Angel + IA en Cursor. El proceso de ir de idea a producto desplegado: PRD, UX, arquitectura, implementacion, deploy, mejoras. Eventualmente se formaliza como pipeline propio, pero hoy es un proceso manual con IA. No es parte del codigo de Abeja.

### Productos (operar)

Pajarillo tiene su UI ganadera. Vecino tiene su editorial. Cada producto vive en su propio repo, con su propio stack, su propia interfaz. Abeja solo sabe que existen y que tareas tienen pendientes.

---

## Modelo de datos

Dos niveles. Un solo tipo.

```
Space (proyecto)
  └── Task (unidad de trabajo)
        ├── Comentarios (texto, con adjuntos)
        ├── Estado (open, done)
        └── Metadata (deadline, tags, source)

Contacto (asociado al Space, no a la task)
```

### Task

Lo unico que se captura. "Implementar modulo de pesaje", "Firmar contrato con Javier", "Investigar painpoints de papas". Todo es una task. El contexto se acumula en los comentarios de la task.

### Comentarios

Cada task tiene comentarios. Un comentario puede tener adjuntos (archivos, imagenes, PDFs). Los comentarios son el historial vivo de la task — decisiones, avances, bloqueos.

### Contactos

Se asocian al **Space**, no a tasks individuales. Son personas relevantes para ese proyecto. No tienen acceso — son datos de referencia para cuando agentes IA operen el space a traves de MCPs futuros.

### Recurrencia

No existe dentro de Abeja. La recurrencia pertenece al producto cuando se construye. "Generar reporte de analytics semanal" es un cron de Vecino desplegado, no una task recurrente en Abeja.

---

## Spaces actuales

Cada space es un proyecto real. Abeja los observa — no los contiene.

| Space | Repo | Que es | Sombrero |
|-------|------|--------|----------|
| Pajarillo | `~/Vacamorada` | Gestion ganadera. Finca en los Llanos. | Ganadero |
| Finca Legal | — | Contratos, impuestos, avaluos, propiedad | Legal/admin |
| Vecino | `~/Desktop/vecino` | Plataforma de noticias para comunidades | Editor/producto |
| La Malandra | `~/lamalandra` | Sitio de noticias neobrutalist | Editorial |
| Republica Malandra | `~/republicamalandraboard` | Dashboard del universo Malandra | Creativo |
| Manas y Malandros | `~/Malandros_Tablero` | Juego de cartas online | Game design |
| Canticuento | — | Cuentos para ninos, plataforma editorial | Creativo |
| Govtech / MiPQRSD | `~/pqrds_analyzer_2026` | Analisis de peticiones ciudadanas | Govtech |
| Personal | — | Crecimiento, maximas, blog (privado) | Personal |
| Familia | — | Hijos, hogar | Personal |
| Abeja | `~/abeja` | Este tablero de control | Meta |
| Sandbox | — | Ideas sueltas sin space definido | Libre |

---

## Monetizacion

Dos vias:

1. **Los productos** — Pajarillo, Vecino, MiPQRSD, etc. Cada uno genera valor propio.
2. **La fabrica** — El proceso de ir de idea a producto desplegado. Lo que Designo hacia con 20 personas, ahora comprimido con IA. Es un servicio o producto en si mismo.

Abeja soporta ambas vias: rastrea el estado de los productos (via 1) y del proceso de construccion (via 2).

---

## Captura

### Momento de captura

Angel camina, piensa, y envia mensajes con lo que se le ocurre. No quiere abrir una app, no quiere elegir un space, no quiere clasificar nada. Solo escribe y sigue caminando.

### Flujo: agente + MCP

La inteligencia de clasificar no vive en Abeja — vive en un agente IA (Claude u otro) que tiene acceso a Abeja via MCP.

```
Angel (WhatsApp) → Agente IA → MCP de Abeja → Accion correcta
```

El agente conoce los spaces, ve las tasks existentes, y decide: "esto es un comentario en la task 'Contrato con Javier' del space Finca Legal" o "esto es una task nueva para Pajarillo". Angel no clasifica — el agente lo resuelve.

### Operaciones del MCP

Abeja expone CRUD puro. La inteligencia la pone el agente.

- `list_spaces` — ver todos los spaces
- `list_tasks(space)` — ver tasks de un space
- `create_task(space, body)` — crear task nueva
- `add_comment(task, body, attachments?)` — agregar comentario con adjuntos opcionales
- `add_contact(space, name, info)` — agregar persona al space
- `update_task(task, status)` — marcar como done, reabrir, etc.

### Web

Dashboard para visualizar y gestionar manualmente. Tiene formulario de captura como fallback. No es el canal principal — es para cuando Angel se sienta a revisar y decidir.

---

## Stack tecnico

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict) |
| Base de datos | PostgreSQL — Neon (prod), local (dev) |
| ORM | Prisma 6 |
| UI | React 19 + Tailwind CSS 4 |
| Auth | Cookie password (`abeja_auth`) |
| Testing | Vitest + Testing Library |
| Deploy | Vercel + Neon |

### Ambientes

- **Local**: PostgreSQL en `localhost:5432/abeja`
- **Produccion**: Neon PostgreSQL + Vercel
- **Variables de entorno**: `DATABASE_URL`, `ABEJA_PASSWORD` (default: `abeja2026`)

---

## Convenciones de codigo

### Estructura

```
src/
├── app/           # Next.js App Router (pages + API routes)
├── components/    # Componentes reutilizables
├── lib/           # Utilidades (prisma client, auth, types)
└── middleware.ts  # Auth gate
```

### Patrones

- **Server components** para pages que leen datos (Prisma directo)
- **Client components** para interactividad — marcados con `'use client'`
- **`force-dynamic`** en pages que necesitan datos frescos
- **CSS variables** para theming en `globals.css`
- **Tema oscuro**, font Inter, lang `es`
- **Espanol** en UI. Ingles en codigo y variables.

### Reglas para el builder

1. **Pedir permiso** antes de modificar codigo
2. **Rutas absolutas** en comandos de terminal
3. **No inventar** — si falta info, preguntar
4. **Simplicidad** — solucion simple antes que compleja
5. **Un solo nivel** — no crear abstracciones innecesarias
6. **Probar** que compila antes de reportar como terminado

---

## Estado actual vs destino

### Implementado
- Auth por password (cookie + middleware)
- Home: tasks abiertas agrupadas por space
- Vistas de space con tabs (Tareas / Contexto)
- Lista de capturas con filtros y detalle
- Modal de captura nueva (space + body)
- API: CRUD de capturas, dominios
- Seed desde markdown

### Pendiente (para alinear con esta vision)
- [ ] Eliminar Domain como capa — solo Space → Task
- [ ] Eliminar tipos de captura (fact, idea, referencia) — todo es Task
- [ ] Comentarios en tasks (model existe, UI no)
- [ ] Adjuntos en comentarios
- [ ] Contactos por space
- [ ] MCP con operaciones CRUD (list_spaces, create_task, add_comment, add_contact, update_task)
- [ ] Deploy produccion en Neon + Vercel

### Futuro (cuando madure)
- [ ] Conectar agente IA (Claude) al MCP via WhatsApp
- [ ] Hub por space (contexto completo para agentes operadores)
- [ ] MCPs especializados por space (tools, docs, permisos)
- [ ] Formalizacion de la fabrica como pipeline

---

## Principios

1. **Tablero, no herramienta** — ves, decides, y te vas a ejecutar a otro lado
2. **Cambiar de interfaz = cambiar de sombrero** — cada modo tiene su lugar
3. **Un solo nivel** — Space → Task, sin jerarquias
4. **Captura via conversacion** — Angel escribe, el agente clasifica
5. **Abeja es CRUD, el agente es inteligencia** — Abeja no clasifica, solo almacena y muestra
6. **Todo tiende a delegacion** — cada space eventualmente se opera solo
7. **Preguntar antes de actuar** — no inventar
8. **100% valor capturado por Angel** — sin intermediarios

---

## Organizacion de proyectos

Los proyectos pueden vivir en una carpeta unificada. Mover carpetas no rompe nada — las rutas internas son relativas.

```
~/proyectos/
  ├── abeja/
  ├── vacamorada/
  ├── vecino/
  ├── lamalandra/
  ├── republicamalandra/
  ├── malandros-tablero/
  ├── pqrsd-analyzer/
  └── mapa-finca/
```

Al mover: abrir en Cursor desde la nueva ruta. Verificar `.env` si usa rutas absolutas. `npm install` si `node_modules` tiene links simbolicos a la ruta anterior.

---

## Setup de desarrollo

```bash
cd ~/proyectos/abeja
npm install

# Base de datos local
createdb abeja
cp .env.example .env

# Migraciones + seed
npx prisma migrate dev
npm run seed

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test
```
