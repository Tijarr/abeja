# Abeja — Context

**Ultima actualizacion**: 2026-02-25
**Para**: el builder (IA en Cursor que construye el software)

---

## Que es Abeja

Sistema de despacho de tareas con interfaz web y API para agentes. Angel se sienta, ve el estado de todos sus proyectos organizados por dominio y espacio, decide que hacer, y despacha trabajo a agentes o lo ejecuta el mismo.

**No es** un second brain (eso es `~/brain/`). No es donde se construye software ni donde se operan productos. Es donde se piensa, se decide, y se despacha.

---

## Los tres sombreros

Angel opera en tres modos. Cada modo tiene su propia interfaz y su propio estado mental.

```
PENSAR (Abeja)          CONSTRUIR (Fabrica)         OPERAR (cada producto)
-------------------     ---------------------       ----------------------
que hay que hacer?      como se construye?          como van las vacas?
que falta?              PRD, UX, codigo, deploy     reportes, crons, dia a dia
que decido?             tweaks, iteracion           usuarios, datos reales

Interfaz: Abeja web     Interfaz: Cursor/IDE        Interfaz: cada app
Frecuencia: diario      Frecuencia: por proyecto    Frecuencia: operativa
```

---

## Modelo de datos

Tres niveles. Tasks con tipo y responsable.

```
Domain (agrupacion)
  └── Space (proyecto)
        └── Task (unidad de trabajo)
              ├── Comentarios (texto)
              ├── Documentos (archivos, URLs)
              ├── Estado (open, done)
              ├── Tipo (normal, por defecto; evoluciona a tipos con instrucciones)
              ├── Responsable (nullable)
              └── Metadata (deadline, tags, source, capRef)

Contacto (asociado al Space)
Documento (asociado al Space, vinculado a Tasks)
TaskType (template: instrucciones, herramientas, estructura)
```

### Domain
Agrupacion de alto nivel. Organiza spaces por area de vida/trabajo. Tiene color y orden. Ejemplos: "Finca", "Media", "Personal", "Abeja".

### Space
Proyecto o area dentro de un domain. Tiene slug unico dentro del domain. Cada space acumula tasks, contactos y documentos propios.

### Task
Unidad de trabajo. Tiene un tipo (default "normal") y un responsable opcional. El contexto se acumula en comentarios y documentos vinculados. Cuando una tarea se repite, su tipo evoluciona a un TaskType con instrucciones para agentes.

### TaskType
Template para tipos de tarea recurrentes. Define instrucciones (texto que el agente lee), herramientas disponibles, y estructura esperada. Se crea cuando Angel identifica un patron. Ejemplo: "Scraping de sitio", "Ilustrar estilo Tintin", "Reporte de analytics".

### Document
Entidad separada asociada al Space. Puede vincularse a multiples tasks via TaskDocument. Por ahora almacena URL/referencia. Futuro: storage real (S3, Drive).

### Comment
Texto asociado a una task. Autor puede ser humano o agente. Historial vivo de la task.

### Contact
Asociado al Space. Datos de referencia para agentes. No implica acceso.

---

## Domains y Spaces actuales

| Domain | Space | Repo | Que es |
|--------|-------|------|--------|
| Finca | Pajarillo | `~/Vacamorada` | Gestion ganadera |
| Finca | Finca Legal | — | Contratos, impuestos, propiedad |
| Media | Vecino | `~/Desktop/vecino` | Noticias para comunidades |
| Media | La Malandra | `~/lamalandra` | Noticias neobrutalist |
| Media | Republica Malandra | `~/republicamalandraboard` | Dashboard Malandra |
| Media | Manas y Malandros | `~/Malandros_Tablero` | Juego de cartas online |
| Media | Canticuento | — | Cuentos para ninos |
| Govtech | MiPQRSD | `~/pqrds_analyzer_2026` | Analisis de peticiones ciudadanas |
| Personal | Personal | — | Crecimiento, maximas, blog |
| Personal | Familia | — | Hijos, hogar |
| Abeja | Abeja | `~/abeja` | Este sistema |
| Abeja | Sandbox | — | Ideas sueltas |

---

## Captura y MCP

### Momento de captura

Angel camina, piensa, envia mensajes. No clasifica nada. El agente resuelve donde va.

### Flujo

```
Angel (WhatsApp) → Agente IA (OpenClaw) → MCP de Abeja → Accion correcta
```

### Operaciones del MCP

Abeja expone CRUD puro via MCP (Model Context Protocol). La inteligencia la pone el agente.

- `list_domains` — ver dominios con sus spaces
- `list_spaces(domain?)` — ver spaces, opcionalmente por domain
- `list_tasks(space, status?)` — tasks de un space
- `get_task(id)` — detalle con comentarios y documentos
- `create_task(space, body, type?, assignee?)` — crear task
- `update_task(id, status?, assignee?, type?)` — actualizar task
- `add_comment(task_id, body, author?)` — agregar comentario
- `add_document(space, name, url)` — agregar documento al space
- `link_document(task_id, document_id)` — asociar documento a task
- `list_contacts(space)` — contactos del space
- `add_contact(space, name, role?, phone?, email?)` — agregar contacto

### Web

Dashboard para visualizar y gestionar. Formulario de captura como fallback. No es el canal principal.

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
| MCP | `@modelcontextprotocol/sdk` (Node.js) |
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

mcp/               # MCP server standalone (Node.js)
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
5. **Probar** que compila antes de reportar como terminado

---

## Setup de desarrollo

```bash
cd ~/abeja
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
