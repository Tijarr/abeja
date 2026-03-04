# Abeja UI/UX Design Specifications

Extracted from Figma screenshots at three breakpoints (Desktop 1280x800, Tablet 768x1024, Mobile 375x812) and cross-referenced with the current codebase.

---

## 1. Design Tokens

### 1.1 Colors

| Token                | CSS Variable          | Hex / Value                  | Usage                                       |
|----------------------|-----------------------|------------------------------|---------------------------------------------|
| Background           | `--bg`                | `#0a0a0a`                    | Page background, full-bleed                 |
| Surface              | `--surface`           | `#131316`                    | Sidebar bg, cards, input fields             |
| Surface Hover        | `--surface-hover`     | `#1a1a1f`                    | Row hover, active sidebar items             |
| Surface Active       | `--surface-active`    | `rgba(255,255,255,0.06)`     | Pressed state                               |
| Border               | `--border`            | `#1e1e24`                    | Separators, input borders, sidebar divider  |
| Border Hover         | `--border-hover`      | `#2e2e36`                    | Hovered border state                        |
| Text Primary         | `--text`              | `#e8e8ed`                    | Task descriptions, headings, active items   |
| Text Secondary       | `--text-secondary`    | `#7e7e8c`                    | Inactive sidebar items, assignee names      |
| Text Tertiary        | `--text-tertiary`     | `#4e4e56`                    | Dates, counts, domain headers, muted labels |
| Accent               | `--accent`            | `#C8F135`                    | Lime-green accent (buttons, active states)  |
| Overdue Date         | (inline)              | `#d4636c`                    | Task date when past deadline                |
| Selection BG         | (inline)              | `rgba(200,241,53,0.2)`       | Text selection highlight                    |

#### Priority Diamond Colors (from Figma)

The Figma design uses colored diamond shapes (rotated squares) as priority indicators. These are **not yet implemented** in the codebase. The following hex values are extracted from the screenshots:

| Priority  | Hex (estimated)  | Visual Description                         |
|-----------|------------------|--------------------------------------------|
| Urgent    | `#E05252`        | Red diamond -- highest urgency             |
| High      | `#E0A832`        | Yellow/amber diamond -- high importance    |
| Medium    | `#4A9EE5`        | Blue diamond -- standard/medium priority   |
| Low       | `#45B86C`        | Green diamond -- low priority              |
| Deferred  | `#A855C8`        | Purple/magenta diamond -- deferred/someday |

> **Note:** The current codebase has no `priority` field in the Prisma schema and no diamond-shaped priority indicator in `TaskRow.tsx`. The Figma design introduces this as a new concept that must be implemented.

### 1.2 Typography

| Element                  | Font       | Size    | Weight   | Style / Notes                                    |
|--------------------------|------------|---------|----------|--------------------------------------------------|
| Logo "ABEJA.CO"          | Inter      | ~15px   | 800      | Uppercase, lime-green accent color (`#C8F135`)   |
| Page heading "Inbox"     | Inter      | ~22px   | 600      | White (`--text`), with dropdown chevron          |
| Tab labels               | Inter      | 13px    | 400/500  | Secondary color; active tab is `--text`          |
| Tab count "(15)"         | Inter      | 13px    | 400      | Tertiary color, immediately after tab label      |
| Section label "... Tareas Activas 15" | Inter | 13px | 500 | `--text-secondary`, with triple-dot icon prefix  |
| Domain header (sidebar)  | Inter      | 10px    | 600      | Uppercase, `letter-spacing: 0.1em`, `--text-tertiary` |
| Sidebar space name       | Inter      | 13px    | 400/500  | `--text-secondary` (inactive), `--text` (active) |
| Sidebar space count      | Inter      | 11px    | 400      | `--text-tertiary`, tabular-nums, right-aligned   |
| Task description text    | Inter      | 14px    | 400      | `--text` (open), `--text-tertiary` (done)        |
| Task created date column | Inter/mono | 11px    | 400      | `--text-tertiary`, monospaced, "19 feb" format   |
| Assignee name            | Inter      | 12px    | 400      | `--text-secondary`, right-aligned column         |
| Due date column           | Inter/mono | 11px    | 400/500  | `--text-tertiary`; overdue = `#d4636c`           |
| "Sistema Activo" label   | Inter      | 11px    | 400      | `--text-tertiary`, preceded by green dot          |
| Inbox sidebar item       | Inter      | 13px    | 400/500  | With inbox icon and count badge                  |

### 1.3 Spacing

| Element                   | Value           | Notes                                           |
|---------------------------|-----------------|--------------------------------------------------|
| Sidebar width (desktop)   | 220px           | Fixed, does not collapse                         |
| Sidebar width (mobile drawer) | 280px       | Slides in from left                              |
| Sidebar header height     | 52px            | Contains logo "ABEJA.CO"                         |
| Sidebar horizontal padding| 8px (px-2)      | Nav section; header uses 16px (px-4)             |
| Sidebar vertical padding  | 8px (py-2)      | Nav and footer sections                          |
| Sidebar item height       | ~28px           | `py-1` (4px top/bottom) + text line height       |
| Sidebar item left padding (spaces) | 20px  | Indented under domain group                      |
| Main content left padding | 16px (mobile), 32px (desktop) | `px-4 md:px-8`                      |
| Header bar height         | 52px            | "Inbox" heading row                              |
| Task row height           | 40px            | Consistent across all rows                       |
| Task row horizontal padding| 8px            | Internal padding                                 |
| Task row internal gap     | 10px            | Between icon, date, separator, text, assignee    |
| Priority diamond size     | ~10px           | Rotated square, roughly 10x10px visual footprint |
| Date column width (created)| ~50px          | Fits "19 feb" format                             |
| Assignee column width     | ~120-140px      | Right-aligned, flexible                          |
| Due date column width     | ~50px           | Right-most column, "27 feb" format               |
| Vertical separator        | 1px wide, ~20px tall | `--border` color, between date and description |
| Tab row gap               | ~16px           | Between tab items                                |
| Tab to content gap        | ~12px           | Below tabs, above section label                  |

### 1.4 Border / Separator Styles

| Element                         | Style                                                |
|---------------------------------|------------------------------------------------------|
| Sidebar right border            | `1px solid var(--border)` (#1e1e24)                  |
| Sidebar header bottom border    | `1px solid var(--border)`                            |
| Sidebar footer top border       | `1px solid var(--border)`                            |
| Task row left accent border     | `2px solid {spaceColor}` (or transparent)            |
| Task row vertical separators    | `1px solid var(--border)`, roughly 20px tall, between created-date column and description column |
| Task row bottom border          | None visible -- rows are separated by background gap |
| Mobile header bottom border     | `1px solid var(--border)`                            |

---

## 2. Component Specifications

### 2.1 Sidebar

**Structure (top to bottom):**

1. **Logo area** (h: 52px, px: 16px)
   - "ABEJA.CO" in lime-green (`#C8F135`), bold/extrabold, ~15px, uppercase
   - Bottom border separator

2. **Inbox item**
   - Envelope/inbox icon (14x14, stroke style)
   - Label: "Inbox"
   - Right-aligned count badge: "5" in `--text-tertiary`, 11px, tabular-nums
   - Active state: `--surface-hover` background, `--text` color, font-weight 500

3. **Domain sections** (repeating pattern)
   - **Domain header row:**
     - Chevron icon (10x10, rotatable, `--text-tertiary`): right-pointing when collapsed, down when expanded
     - Domain name in uppercase, 10px, semibold, `letter-spacing: 0.1em`, `--text-tertiary`
     - Edit icon appears on hover (opacity 0 -> 1 transition)
     - Clickable to toggle collapse; state persisted to `localStorage`
   - **Space items** (when expanded):
     - Hexagon outline icon (14x14, stroke color = space or domain color)
     - Space name: 13px, truncated with ellipsis
     - Count badge: 11px, tabular-nums, right-aligned, `--text-tertiary`
     - Edit icon on hover

4. **Domain groups visible in Figma:**
   - **FINCA**: Finca Legal (12), Finca Contable (8), Propiedad (5), Analisis (3)
   - **MEDIA**: Blog (24), Redes (156), Lanzamiento (7), SEO (45)
   - **PERSONAL**: Empleado (18), Nomina (12), Beneficios (9), Expediente (18)
   - **ABEJA**: Nodo IA (6), Agente (4), Caja (2, tablet only), Automatizacion (11, tablet only)

5. **"Sistema Activo" indicator** (bottom-left, above footer)
   - Green filled circle (~6px diameter)
   - Label: "Sistema Activo", 11px, `--text-tertiary`
   - Pinned to sidebar bottom

6. **Footer area** (current codebase)
   - "Nueva tarea" button: lime-green background, dark text, 12px font, full-width, rounded-md
   - This button is NOT visible in the Figma screenshots -- the Figma shows "Sistema Activo" instead

### 2.2 Task Row (Figma Design -- New Layout)

The Figma design shows a significantly different task row layout from the current codebase. The Figma version introduces priority diamonds and a multi-column layout.

**Figma Task Row Layout (left to right):**

```
| [Priority Diamond] | [Created Date] | [Separator] | [Task Description ...] | [Assignee Name] | [Due Date] |
```

**Column breakdown:**

1. **Priority Diamond** (~10px)
   - A small diamond shape (rotated 45-degree square)
   - Filled with the priority color (red/yellow/blue/green/purple)
   - No border, solid fill
   - Vertically centered in the row

2. **Created Date** (~50px)
   - Format: "19 feb" (day + lowercase 3-letter Spanish month abbreviation)
   - Font: 11px monospaced, `--text-tertiary`
   - Right-aligned within its column

3. **Vertical Separator**
   - 1px wide line, `--border` color
   - Height: roughly half the row height (~20px)
   - Vertically centered

4. **Task Description** (flex: 1, fills remaining space)
   - Font: 14px, `--text` color, font-weight 400 (bold in Figma)
   - Truncated with ellipsis on overflow
   - The Figma shows task text in a slightly bolder weight than the current 400

5. **Assignee Name** (~120-140px)
   - Font: ~12px, `--text-secondary` color
   - Displays full name: "Maria Gonzalez", "Ana Lopez", etc.
   - Shows em-dash "--" when no assignee
   - Right-aligned or right-justified

6. **Due Date** (~60px)
   - Format: "27 feb" or "04 mar"
   - Font: 11px monospaced, `--text-tertiary`
   - Right-aligned, rightmost column

**Row specifications:**
- Height: 40px
- Background: transparent (inherits `--bg`)
- Hover: `--surface-hover` (#1a1a1f)
- No visible bottom border between rows
- No left accent border visible in Figma (differs from current code)
- Padding: ~8px horizontal

**Key differences from current codebase:**
- Current uses a circle `StatusIcon` (open/done); Figma uses priority diamonds
- Current has a left colored border (`spaceColor`); Figma does not
- Current uses `Initials` component (avatar circle); Figma shows full assignee name as text
- Figma adds an explicit vertical separator between date and description
- Figma shows created date as a separate left column (not combined with due date)
- The Figma layout has both a created date (left) and due date (right) visible simultaneously

### 2.3 Tabs

**Location:** Below the "Inbox" heading, above the task list.

**Tab items visible in Figma:**
- `Activas (15)` -- active tab
- `Delegadas (9)` -- inactive
- `Finalizadas (6)` -- inactive

**Active tab style:**
- Text color: `--text` (#e8e8ed), white/light
- Font weight: 500 (medium)
- The count in parentheses appears in the same style
- No visible underline decoration in the Figma (differs from some tab patterns)
- Background: none visible

**Inactive tab style:**
- Text color: `--text-tertiary` (#4e4e56)
- Font weight: 400
- Count in parentheses same muted color

**Tab specs:**
- Font size: 13px
- Gap between tabs: ~16px
- No visible dividers between tabs
- Horizontal alignment: left-aligned, below heading

**Comparison with current codebase:**
- Current implements `Abiertas / Completadas / Todas` tabs (different labels)
- Current uses pill-style background highlight for active tab (`--surface-hover` bg)
- Figma uses text-weight/color differentiation only (no background pill)
- Figma introduces "Delegadas" (delegated tasks) -- a concept not in the current schema

### 2.4 Page Header

**"Inbox" heading area:**
- Text: "Inbox" in ~22px, font-weight 600, `--text` color
- Dropdown chevron: small downward-pointing arrow (~10px) immediately to the right
- The chevron suggests a dropdown to switch views (Inbox, All Tasks, etc.)
- Height: 52px row
- Left-aligned, with left padding matching main content (`px-4 md:px-8`)

**Comparison with current codebase:**
- Current homepage shows "Tareas" as heading (not "Inbox")
- No dropdown chevron in current implementation
- The "Inbox" concept with delegated/finalized tabs is a new UX paradigm

### 2.5 Section Label ("... Tareas Activas 15")

**Layout:**
- Three-dot icon (horizontal ellipsis / "more" icon) on the left
- Label: "Tareas Activas" in 13px, font-weight 500, `--text-secondary`
- Count: "15" in 13px, font-weight 400, `--text-tertiary`
- Positioned between the tab row and the first task row
- Acts as a section subheader / group label

**The three-dot icon suggests:**
- A context menu for bulk actions (select all, sort, filter)
- Approximately 16x4px bounding box with three 3px circles

---

## 3. Responsive Behavior

### 3.1 Desktop (1280x800)

- **Sidebar:** Permanently visible, 220px fixed width, left column
- **Main content:** Fills remaining width (1060px)
- **Task rows:** Full layout visible -- priority diamond, created date, separator, full description text, full assignee name, due date
- **All columns visible** with ample horizontal space
- **No truncation** of task descriptions at this width

### 3.2 Tablet (768x1024)

- **Sidebar:** Still visible, 220px fixed width (same as desktop)
- **Main content:** 548px available width
- **Task description:** Truncated with ellipsis ("Revisar y aprobar los c...", "Crear 3 articulos sobre...")
  - Truncation occurs at approximately 20-25 characters
  - Uses CSS `text-overflow: ellipsis; overflow: hidden; white-space: nowrap`
- **Assignee name:** Still fully visible ("Maria Gonzalez", "Ana Lopez")
- **Due date:** Still visible in rightmost column
- **Created date and priority diamond:** Still visible
- **Additional sidebar items visible:** Caja (2), Automatizacion (11) appear at the bottom of ABEJA domain group (more vertical scroll space available)
- Vertical scrolling accommodates all 15 task rows

### 3.3 Mobile (375x812)

**Current Figma behavior (problematic):**
- The sidebar is displayed at full width (~210px) taking up over half the screen
- The main content area is extremely compressed
- Only the priority diamond, created date, and vertical separator are visible
- Task descriptions, assignee names, and due dates are completely cut off
- Tabs are partially cut off ("Delegada..." truncated)
- The layout is essentially broken at this width

**Recommended mobile behavior (design correction):**

The mobile breakpoint should implement a **drawer pattern** instead of showing the sidebar inline:

1. **Sidebar:** Hidden by default. Accessible via hamburger menu button in a top navigation bar. Slides in as an overlay drawer (280px wide, already implemented in `AppShell.tsx`).

2. **Mobile header bar:**
   - Hamburger icon (left)
   - "Abeja" centered title or current page name
   - Height: ~48px
   - Bottom border separator
   - (Already implemented in codebase but not reflected in Figma)

3. **Task row mobile layout:**
   - Priority diamond + full task description (truncated with ellipsis)
   - Assignee and dates move to a second line or are hidden
   - Alternatively, use a card-based layout for mobile
   - Row height can increase to accommodate wrapped content

4. **Tabs:** Full width, horizontally scrollable if needed, with counts visible

5. **FAB (Floating Action Button):** Already implemented in codebase -- lime-green circle "+" button, bottom-right, 56x56px, visible on mobile only (`md:hidden`)

> **Action required:** The Figma mobile screenshot needs redesign. The current Figma mobile comp shows the sidebar always visible alongside the content, which breaks the layout. The codebase already has the correct responsive behavior (drawer pattern with `md:` breakpoint at 768px). The Figma should be updated to reflect this.

---

## 4. Accessibility Review

### 4.1 Color Contrast Concerns

| Issue | Element | Details | Recommendation |
|-------|---------|---------|----------------|
| FAIL  | Priority diamonds on dark bg | Small colored shapes (~10px) on `#0a0a0a` background. While the fill colors are vibrant, the small size makes them hard to distinguish for colorblind users. | Add a secondary indicator (shape variation, letter label, or tooltip). Consider: circle=urgent, diamond=high, square=medium, triangle=low. |
| WARN  | Tertiary text (`#4e4e56` on `#0a0a0a`) | Contrast ratio is approximately 2.5:1, which fails WCAG AA minimum of 4.5:1 for normal text. | Lighten to at least `#737380` (~4.5:1) or increase font size to 18px+ (which only requires 3:1). |
| WARN  | Secondary text (`#7e7e8c` on `#0a0a0a`) | Contrast ratio is approximately 4.2:1, which narrowly fails WCAG AA for normal text. | Lighten slightly to `#8a8a98` or ensure usage is limited to large text / supplementary info. |
| PASS  | Primary text (`#e8e8ed` on `#0a0a0a`) | Contrast ratio is approximately 16.5:1. Excellent. | No action needed. |
| WARN  | Assignee names in `--text-secondary` on dark bg | 4.2:1 ratio at 12px size. | Increase to at least 13px or lighten color. |
| PASS  | Accent on dark (`#C8F135` on `#0a0a0a`) | High contrast (~11:1). | No action needed. |

### 4.2 Focus Indicators

**Current implementation:** `globals.css` defines `:focus-visible` with `2px solid var(--accent)` and `2px offset`. This is good.

**Gaps identified:**
- The sidebar domain group toggle (chevron) is a `<div>` with `onClick` -- not keyboard-focusable. Should be a `<button>` or have `role="button"` and `tabIndex={0}`.
- Priority diamonds (once implemented) need `aria-label` to convey priority level (e.g., `aria-label="Prioridad: urgente"`).
- The mobile drawer close button needs clear focus visibility when tabbing inside the drawer.
- Tab links in the tab bar need visible focus rings, which are covered by the global `:focus-visible` rule.

### 4.3 ARIA Labels and Roles

**Needed additions:**

| Element | ARIA Recommendation |
|---------|---------------------|
| Priority diamond | `aria-label="Prioridad: {level}"` or `title` attribute |
| Task row | `role="row"` within a `role="table"` or `role="list"` with `role="listitem"` |
| Sidebar domain group | `role="group"` with `aria-label="{domain name}"`, toggle button with `aria-expanded` |
| Sidebar collapse chevron | `aria-expanded="true/false"`, `aria-controls="domain-{slug}-spaces"` |
| Tab bar | `role="tablist"` with `role="tab"` on each tab, `aria-selected="true"` on active |
| "Sistema Activo" indicator | `role="status"` with `aria-label="Estado del sistema: activo"` |
| Assignee column | `aria-label="Asignado a: {name}"` or screen-reader-only label |
| Em-dash ("--") for empty assignee | `aria-label="Sin asignar"` instead of visual-only dash |
| Count badges in sidebar | Part of the link text, already accessible; ensure it reads as "{name}, {count} tareas" |

### 4.4 Screen Reader Considerations for Task Rows

Each task row should be announced with all relevant information in a logical order:

```
"Tarea: {description}. Prioridad: {level}. Fecha de creacion: {date}.
Asignado a: {assignee or 'sin asignar'}. Fecha limite: {due date or 'sin fecha limite'}."
```

**Implementation approach:**
- Wrap the task row in a semantic list (`<ul>` / `<li>`) or use a `<table>` with proper headers
- Add visually-hidden column headers for screen readers
- Priority diamond should have `role="img"` with descriptive `aria-label`
- Use `<time>` elements for dates with `datetime` attribute in ISO format

---

## 5. Copy Review (Spanish Text Inventory)

### 5.1 All Visible Text in Figma

**Navigation / Chrome:**
- "ABEJA.CO" -- brand logo
- "Inbox" -- page heading
- "Sistema Activo" -- system status indicator

**Tabs:**
- "Activas" -- active tasks tab
- "Delegadas" -- delegated tasks tab
- "Finalizadas" -- completed tasks tab
- "(15)", "(9)", "(6)" -- tab counts

**Section label:**
- "Tareas Activas" -- section subheader
- "15" -- count

**Domain headers (sidebar):**
- "FINCA"
- "MEDIA"
- "PERSONAL"
- "ABEJA"

**Space names (sidebar):**
- "Finca Legal", "Finca Contable", "Propiedad", "Analisis"
- "Blog", "Redes", "Lanzamiento", "SEO"
- "Empleado", "Nomina", "Beneficios", "Expediente"
- "Nodo IA", "Agente", "Caja", "Automatizacion"

**Task descriptions (sample):**
- "Revisar y aprobar los contratos de propiedad pendientes antes del cierre fiscal"
- "Crear 3 articulos sobre tendencias en automatizacion y IA para el Q1"
- "Calcular y distribuir pagos del mes de febrero a todos los empleados"
- "Analisis de terminos y condiciones de nuevos proveedores tecnologicos"
- "Revision completa de vulnerabilidades y parches de seguridad"
- "Crear deck de presentacion con metricas del Q1 y proyecciones"
- "Revisar y actualizar la documentacion de APIs y servicios"
- "Analizar comentarios y sugerencias del ultimo sprint"
- "Mejorar rendimiento de queries mas lentas"
- "Definir estrategia y timeline para migracion de infraestructura"
- "Disenar e implementar panel de metricas en tiempo real"
- "Mejorar arquitectura y manejo de errores"
- "Configurar logging centralizado para debugging"
- "Aumentar cobertura de tests al 80%"
- "Actualizar terminos segun nuevas regulaciones"

**Assignee names:**
- "Maria Gonzalez", "Ana Lopez", "Laura Fernandez", "Roberto Diaz"
- "Sofia Ramirez", "Carmen Vega", "Miguel Angel Castro"
- "Patricia Herrera", "Alberto Mendoza"

**Date formats:**
- Created dates: "19 feb", "21 feb", "17 feb", "16 feb", etc.
- Due dates: "27 feb", "04 mar", "26 feb", "07 mar", etc.

**Current codebase text (not in Figma):**
- "Inicio" -- home nav item
- "Tareas" -- tasks nav item / page heading
- "Nueva tarea" -- new task button
- "Buscar tareas..." -- search placeholder
- "Sin tareas abiertas" -- empty state
- "Crea una para comenzar" -- empty state subtitle
- "Abiertas", "Completadas", "Todas" -- current tab labels (different from Figma)
- "Abrir menu" -- mobile hamburger aria-label
- "Cerrar menu" -- mobile close button aria-label
- "Describe la tarea..." -- modal textarea placeholder
- "Espacio" -- space selector label
- "Tipo" -- type selector label
- "Tags" -- tags input label
- "Cancelar", "Crear tarea", "Guardando..." -- modal buttons
- "Cmd+K para abrir / Cmd+Enter para crear" -- keyboard shortcut hint

### 5.2 Label Consistency Issues

| Issue | Details | Recommendation |
|-------|---------|----------------|
| Tab label mismatch | Figma: "Activas / Delegadas / Finalizadas". Code: "Abiertas / Completadas / Todas". | Align to Figma. "Activas" is more natural in Spanish for active tasks. "Delegadas" is a new concept. |
| Missing accents | Figma text lacks accent marks: "Analisis" should be "Analisis" (though the accent may not be visible at screenshot resolution). Verify in production: "Nomina" -> "Nomina", "Automatizacion" -> "Automatizacion". | Ensure all Spanish text uses proper diacritics in the database and UI. |
| "Inbox" vs "Tareas" | Figma uses "Inbox" as the main view. Code uses "Tareas". These represent different UX concepts. | "Inbox" implies a triage workflow (active/delegated/done). "Tareas" is a flat list. Implement both as separate views or unify under "Inbox". |
| Heading as "Inbox" with dropdown | Figma shows "Inbox" with a dropdown chevron, suggesting switchable views. Not implemented in code. | Add view switcher component. |

### 5.3 Date Format

**Format used:** `"19 feb"` -- day (numeric, no leading zero) + space + lowercase 3-letter Spanish month abbreviation.

**Current code implementation:**
```js
displayDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
```

This uses the Colombian Spanish locale which produces: `"19 feb."` (with trailing period on the month abbreviation). The Figma shows no period.

**Recommendation:** Either:
- Strip the trailing period in code: `.replace('.', '')`
- Use a custom formatter for consistent output
- Verify locale output matches the design exactly

**Month abbreviations expected (Spanish):**
- ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic

---

## 6. Gap Analysis: Figma vs. Current Codebase

### 6.1 Features in Figma NOT in Code

| Feature | Status | Implementation Notes |
|---------|--------|---------------------|
| Priority system (diamond indicators) | **Not implemented** | Add `priority` field to Task model (enum: urgent, high, medium, low, deferred). Create `PriorityDiamond` component. |
| "Inbox" view concept | **Not implemented** | New page/view showing user's inbox with triage workflow. |
| Tabs: Activas/Delegadas/Finalizadas | **Not implemented** | "Delegadas" requires a delegation model (assigned-to vs. assigned-by). "Finalizadas" maps to `status: 'done'`. |
| Dropdown view switcher on heading | **Not implemented** | Add dropdown to switch between Inbox, All Tasks, or filter modes. |
| Section label with "..." menu | **Not implemented** | Add section header component with context menu (bulk actions). |
| Assignee as full name text (not initials) | **Partial** | Code has `Initials` component showing avatar circle. Figma shows full name as plain text. May need both for different contexts. |
| "Sistema Activo" status indicator | **Not implemented** | Add system health indicator to sidebar footer. |
| Vertical separator in task row | **Not implemented** | Add CSS separator between date column and description. |
| Two-date layout (created + due) | **Partial** | Code shows one date (deadline or created). Figma shows both simultaneously in separate columns. |

### 6.2 Features in Code NOT in Figma

| Feature | Notes |
|---------|-------|
| Circle StatusIcon (open/done) | Figma replaces with priority diamond |
| Left space-color border on task row | Not visible in Figma |
| Initials avatar circle | Figma shows full name text instead |
| TypeBadge component | Not visible in Figma task rows |
| TagPills component | Not visible in Figma task rows |
| Search bar on homepage | Not visible in Figma Inbox view |
| "Nueva tarea" button in sidebar | Not visible; Figma shows "Sistema Activo" in footer |
| FAB (mobile floating button) | Not visible in Figma (mobile design is broken) |
| Domain color dot on homepage | Different layout; Figma uses Inbox pattern |

---

## 7. Implementation Priority Recommendations

1. **Add priority field to schema** -- new migration adding `priority` enum to Task model
2. **Create `PriorityDiamond` component** -- 10px rotated square with color mapping
3. **Redesign TaskRow** -- match Figma's column layout (diamond, created date, separator, description, assignee name, due date)
4. **Implement Inbox view** -- new `/inbox` route with Activas/Delegadas/Finalizadas tabs
5. **Update sidebar** -- add "Inbox" as primary nav item, add "Sistema Activo" footer
6. **Fix mobile Figma design** -- update Figma to reflect the drawer pattern already in code
7. **Address accessibility** -- fix contrast ratios, add ARIA attributes, semantic markup
8. **Normalize date formatting** -- ensure "19 feb" format (no trailing period) across the app
