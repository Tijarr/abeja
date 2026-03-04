# PRD: Rediseno de UI basado en Figma

**Fecha**: 2026-02-26
**Autor**: Angel Tijaro (Product Owner)
**Estado**: Draft
**Prioridad**: Alta
**Epoca estimada**: Q1 2026

---

## 1. Resumen ejecutivo

Este documento especifica el rediseno completo de la interfaz web de Abeja basado en los mockups de Figma entregados. El rediseno abarca tres areas principales: (1) una barra lateral rediseada con branding actualizado, item de Inbox nuevo e indicador de estado del sistema, (2) un sistema de pestanas de tres estados (Activas / Delegadas / Finalizadas) que reemplaza las pestanas actuales de dos estados, y (3) un rediseno completo de las filas de tareas con indicadores de prioridad por diamante de color y una disposicion de columnas nueva.

El alcance incluye cambios en el modelo de datos (nuevo campo `priority`, nuevo estado `delegated`), nuevos componentes de UI, y un comportamiento responsivo corregido para movil.

---

## 2. Contexto y motivacion

### Estado actual

Abeja tiene una interfaz funcional pero minima. La barra lateral muestra "Abeja" como texto plano, las tareas se filtran entre Abiertas/Completadas/Todas, y las filas de tareas muestran tipo (badge), tags (pills), icono de estado circular, e iniciales del responsable. No existe concepto de "Inbox", de prioridad visual, ni de tareas delegadas.

### Problemas que resuelve el rediseno

1. **Falta de priorizacion visual**: No hay forma de distinguir urgencia de un vistazo. Las tareas se ven iguales independientemente de su importancia.
2. **Modelo de estados limitado**: Solo existe `open` y `done`. Angel delega tareas a agentes y necesita rastrear ese estado intermedio sin perder visibilidad.
3. **Sin punto de entrada unificado**: No hay Inbox. Las tareas se ven por espacio, lo que fragmenta la atencion. Angel necesita un feed unico "que requiere mi atencion".
4. **Branding debil**: El logo "Abeja" como texto no tiene identidad. El Figma introduce "ABEJA.CO" en lime green como marca fuerte.
5. **Informacion de estado del sistema ausente**: No hay indicador de si los agentes/crons estan operativos.

---

## 3. Objetivos y no-objetivos

### Objetivos

| # | Objetivo | Metrica de exito |
|---|----------|------------------|
| O1 | Implementar la vista Inbox como pantalla principal | Inbox se carga como ruta por defecto (`/`). Muestra tareas de todos los espacios. |
| O2 | Reemplazar el sistema de pestanas de 2 estados por 3 estados | Las pestanas Activas/Delegadas/Finalizadas funcionan y muestran conteos correctos. |
| O3 | Agregar prioridad visual con diamantes de color a cada tarea | 100% de las tareas nuevas tienen prioridad. Las existentes migran a `normal`. |
| O4 | Redisenar la fila de tareas segun el Figma | Cada fila muestra: diamante de prioridad, fecha de creacion, separador, titulo en negrita, nombre del responsable, fecha limite. Sin badges de tipo, sin pills de tags. |
| O5 | Actualizar la barra lateral con branding, Inbox y estado del sistema | Logo "ABEJA.CO" en `#C8F135`. Item de Inbox con icono de sobre y badge de conteo. "Sistema Activo" con punto verde al fondo. |
| O6 | Corregir el comportamiento responsivo en movil | Movil usa patron drawer (ya existente) en vez de sidebar comprimida junto al contenido. |

### No-objetivos

| # | No-objetivo | Razon |
|---|-------------|-------|
| N1 | Implementar logica de delegacion automatica a agentes | Este PRD cubre la UI y el campo de datos, no la logica de dispatch. |
| N2 | Crear un sistema de notificaciones en tiempo real para Inbox | Inbox es una consulta al cargar la pagina. Push/websockets quedan fuera de alcance. |
| N3 | Eliminar las vistas actuales de tareas por espacio | Las vistas `/space/:slug` siguen existiendo. Inbox es una vista transversal adicional. |
| N4 | Redisenar la vista de detalle de tarea (`/task/:id`) | Solo se redisena el listado. El detalle se aborda en un PRD posterior. |
| N5 | Implementar el dropdown/selector de espacio en el header de Inbox | El Figma muestra un chevron junto a "Inbox" sugiriendo un selector. Se implementa la vista de Inbox sin filtro por espacio en v1. El filtro se aborda en v2. |
| N6 | Agregar funcionalidad al menu de tres puntos del subheader | El icono se renderiza pero no tiene acciones asignadas en esta version. |

---

## 4. Especificacion detallada de features

### 4.1 Sidebar rediseado

#### 4.1.1 Logo y branding

**Estado actual**: Texto "Abeja" en `15px` semibold, color `var(--text)`, dentro de un contenedor de `52px` de alto con borde inferior.

**Estado objetivo**: Texto "ABEJA.CO" en `15px` semibold, color `#C8F135` (lime green, misma variable `--accent`), uppercase. Misma posicion (top-left del sidebar, `px-4`, `h-[52px]`).

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/components/AppShell.tsx`, funcion `SidebarContent`.
- Cambiar el texto de "Abeja" a "ABEJA.CO".
- Cambiar el color de `var(--text)` a `var(--accent)`.

**Criterios de aceptacion**:
- [ ] El texto "ABEJA.CO" aparece en la esquina superior izquierda del sidebar.
- [ ] El color del texto es exactamente `#C8F135`.
- [ ] El tamano y peso de fuente son `15px` semibold.
- [ ] El contenedor mantiene la altura de `52px`.

#### 4.1.2 Item de Inbox

**Estado actual**: No existe. La navegacion tiene "Inicio" y "Tareas".

**Estado objetivo**: Un item de navegacion "Inbox" con icono de sobre y badge de conteo aparece como el primer item despues del logo. Reemplaza "Inicio" conceptualmente como la vista principal.

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/components/AppShell.tsx`, funcion `SidebarContent`.
- Agregar un nuevo `NavItem` para Inbox con `href="/inbox"` (o `/` si Inbox se convierte en la pagina principal).
- Crear un icono de sobre (SVG inline, consistente con el estilo de iconos existente: 14x14, stroke-based).
- Agregar un badge numerico que muestre el conteo de tareas activas sin asignar (o todas las activas, a definir).
- Archivo: `/Users/angeltijaro/Dev/abeja/src/app/layout.tsx` -- el query de sidebar necesita incluir el conteo para Inbox.

**Definicion del conteo de Inbox**: Numero total de tareas con `status = 'open'` (no delegadas, no finalizadas) a traves de todos los espacios. Este conteo se pasa al componente de sidebar.

**Criterios de aceptacion**:
- [ ] El item "Inbox" aparece como primer item de navegacion en el sidebar, debajo del logo.
- [ ] El icono es un sobre (envelope) de 14x14px, estilo stroke, consistente con HomeIcon y TasksIcon.
- [ ] Un badge numerico aparece a la derecha del texto "Inbox" mostrando el conteo de tareas activas.
- [ ] El badge tiene fondo sutil y texto en `--accent` (similar al patron de `Initials` existente).
- [ ] Hacer clic en "Inbox" navega a la vista de Inbox.
- [ ] El item se resalta cuando la ruta activa es la de Inbox.

#### 4.1.3 Secciones de dominio con conteo por espacio

**Estado actual**: Ya existen. Cada dominio es colapsable con chevron. Cada espacio muestra su nombre y conteo de tareas abiertas. Solo se muestran espacios con tareas.

**Estado objetivo**: Misma estructura. El Figma confirma el patron existente. Cambios cosmeticos menores:
- Los iconos de espacio pasan de hexagono (HexIcon) a circulo relleno con el color del espacio.
- El conteo se muestra como badge con fondo sutil en vez de texto plano.

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/components/AppShell.tsx`, funcion `SpaceLink`.
- Reemplazar `HexIcon` con un circulo de 8x8px, relleno con el color del espacio.
- Envolver el conteo en un span con `background: rgba(255,255,255,0.06)`, `border-radius: 8px`, `padding: 0 6px`, `font-size: 11px`.

**Criterios de aceptacion**:
- [ ] Cada espacio en el sidebar muestra un circulo relleno de 8x8px con el color del espacio (o el color del dominio como fallback).
- [ ] El conteo de tareas de cada espacio se muestra como badge con fondo sutil, no como texto plano.
- [ ] Los dominios siguen siendo colapsables con animacion de chevron.
- [ ] Los espacios sin tareas abiertas no aparecen (comportamiento existente conservado).

#### 4.1.4 Indicador "Sistema Activo"

**Estado actual**: No existe. El fondo del sidebar tiene un boton "Nueva tarea" en la zona inferior.

**Estado objetivo**: En la zona inferior del sidebar, debajo del boton "Nueva tarea", aparece un indicador de estado del sistema: un punto verde pulsante de 6px + texto "Sistema Activo" en `11px`, color `var(--text-tertiary)`.

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/components/AppShell.tsx`, funcion `SidebarContent`.
- Agregar un nuevo bloque debajo del boton "Nueva tarea" (o reemplazar el boton -- ver nota abajo).
- El estado se determina de forma simple en v1: siempre muestra "Sistema Activo". En v2 se conecta a un healthcheck real.
- Animacion CSS: el punto verde debe pulsar suavemente (keyframe `pulse`).

**Nota sobre el boton "Nueva tarea"**: El Figma no muestra un boton de nueva tarea en el sidebar. Se conserva el boton pero se mueve arriba del indicador de estado, ambos en la zona inferior.

**Criterios de aceptacion**:
- [ ] Un indicador con punto verde (6px, `#4ade80`) + texto "Sistema Activo" aparece en la zona inferior del sidebar.
- [ ] El punto verde tiene una animacion de pulso sutil (CSS keyframe, ~2s ciclo).
- [ ] El indicador esta siempre visible cuando el sidebar esta visible (no se oculta al hacer scroll).
- [ ] El texto es `11px`, color `var(--text-tertiary)`, font-weight 400.
- [ ] El boton "Nueva tarea" se conserva y aparece encima del indicador de estado.

#### 4.1.5 Background del sidebar

**Estado actual**: Background `var(--surface)` (`#131316`).

**Estado objetivo**: Background mas oscuro, cercano a `#111114` segun el Figma.

**Cambios requeridos**:
- Opcion A: Cambiar `--surface` en globals.css (afecta toda la app).
- Opcion B (recomendada): Aplicar background inline `#111114` al sidebar, dejando `--surface` intacto para otros usos.

**Criterios de aceptacion**:
- [ ] El background del sidebar es `#111114`.
- [ ] El background del contenido principal no se ve afectado.
- [ ] Tanto el sidebar de desktop como el drawer de movil usan el mismo background oscuro.

---

### 4.2 Sistema de pestanas: Activas / Delegadas / Finalizadas

#### 4.2.1 Nuevo modelo de estados de tarea

**Estado actual**: El campo `status` en la tabla `Task` acepta strings arbitrarios. En la practica se usan dos valores: `"open"` y `"done"`.

**Estado objetivo**: Tres estados formales:
- `"active"` -- tarea abierta, pendiente de ejecucion (equivale al actual `"open"`).
- `"delegated"` -- tarea asignada a un agente o persona, en progreso.
- `"done"` -- tarea completada (sin cambio).

**Cambios requeridos**:
- Migracion de base de datos:
  1. Renombrar todos los registros con `status = 'open'` a `status = 'active'`.
  2. No se crea un enum de Prisma para mantener flexibilidad, pero se documenta la convencion.
- Archivo: `/Users/angeltijaro/Dev/abeja/prisma/schema.prisma` -- agregar comentario documentando los tres estados validos.
- Actualizar todas las queries que filtran por `status: 'open'` para usar `status: 'active'`.
- Archivos afectados:
  - `/Users/angeltijaro/Dev/abeja/src/app/page.tsx` (query de home/Inbox)
  - `/Users/angeltijaro/Dev/abeja/src/app/tasks/page.tsx` (query de tareas)
  - `/Users/angeltijaro/Dev/abeja/src/app/layout.tsx` (conteo de sidebar)
  - Todos los endpoints de API y el servidor MCP que referencien `status: 'open'`.

**Criterios de aceptacion**:
- [ ] Migracion ejecutada: todas las tareas con `status = 'open'` pasan a `status = 'active'`.
- [ ] No existen tareas con `status = 'open'` despues de la migracion.
- [ ] Las tareas con `status = 'done'` no se modifican.
- [ ] El servidor MCP acepta `active`, `delegated`, y `done` como valores de status.
- [ ] El MCP sigue aceptando `open` como alias de `active` por retrocompatibilidad (mapeo interno).

#### 4.2.2 Pestanas en la vista de Inbox / Tareas

**Estado actual**: Tres tabs en `/tasks`: "Abiertas", "Completadas", "Todas". Cada tab es un link con query param `?status=open|done|all`.

**Estado objetivo**: Tres tabs nuevos:
- **Activas (N)** -- tareas con `status = 'active'`. Muestra conteo.
- **Delegadas (N)** -- tareas con `status = 'delegated'`. Muestra conteo.
- **Finalizadas (N)** -- tareas con `status = 'done'`. Muestra conteo.

Se elimina la tab "Todas". Si se necesita ver todo, se usa la pagina de tareas completa (`/tasks`).

**Cambios en UI**:
- Cada tab muestra su label + conteo entre parentesis: "Activas (15)".
- El tab activo tiene fondo `var(--surface-hover)` y texto `var(--text)` (patron existente).
- Los tabs inactivos tienen texto `var(--text-tertiary)` (patron existente).

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/app/tasks/page.tsx` (y/o la nueva ruta de Inbox).
- Reemplazar las tres tabs actuales por las nuevas.
- Cada tab necesita su propio conteo, lo que requiere tres queries `count` (o una query agrupada).

**Criterios de aceptacion**:
- [ ] Se muestran exactamente tres pestanas: "Activas", "Delegadas", "Finalizadas".
- [ ] Cada pestana muestra el conteo correcto de tareas entre parentesis.
- [ ] Hacer clic en una pestana filtra la lista de tareas al status correspondiente.
- [ ] La pestana "Activas" esta seleccionada por defecto.
- [ ] No existe una pestana "Todas".
- [ ] Los conteos se actualizan al recargar la pagina.

#### 4.2.3 Subheader "Tareas Activas"

**Estado actual**: No existe un subheader entre las pestanas y la lista.

**Estado objetivo**: Debajo de las pestanas, un subheader muestra:
- Icono de tres puntos (`...`) a la izquierda.
- Texto: "Tareas Activas 15" (o "Tareas Delegadas 9", etc. segun la pestana activa).
- El icono de tres puntos es un boton que en v1 no tiene accion (placeholder para menu contextual futuro).

**Criterios de aceptacion**:
- [ ] El subheader aparece entre las pestanas y la lista de tareas.
- [ ] El texto refleja la pestana activa: "Tareas Activas N", "Tareas Delegadas N", "Tareas Finalizadas N".
- [ ] El conteo N coincide con el numero de tareas mostradas.
- [ ] El icono de tres puntos se renderiza a la izquierda del texto.
- [ ] El icono es clickeable pero no dispara ninguna accion (cursor pointer, sin handler).

---

### 4.3 Sistema de prioridad

#### 4.3.1 Nuevo campo `priority` en el modelo de datos

**Estado actual**: La tabla `Task` no tiene campo de prioridad. No hay concepto de urgencia.

**Estado objetivo**: Nuevo campo `priority` en `Task` con los siguientes valores:

| Valor | Color del diamante | Uso |
|-------|-------------------|-----|
| `urgent` | Rojo (`#ef4444`) | Requiere atencion inmediata |
| `high` | Amarillo (`#eab308`) | Importante, pronto |
| `normal` | Azul (`#3b82f6`) | Prioridad estandar (default) |
| `low` | Verde (`#22c55e`) | Puede esperar |
| `review` | Morado (`#a855f7`) | Requiere revision/aprobacion |

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/prisma/schema.prisma`.
  - Agregar: `priority String @default("normal")` al modelo `Task`.
- Migracion: `ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';`
- Actualizar el servidor MCP:
  - `create_task` acepta `priority` como parametro opcional.
  - `update_task` acepta `priority` como parametro opcional.
  - `list_tasks` acepta `priority` como filtro opcional.

**Criterios de aceptacion**:
- [ ] El campo `priority` existe en la tabla `Task` con default `"normal"`.
- [ ] Las tareas existentes migran con `priority = 'normal'`.
- [ ] Los cinco valores (`urgent`, `high`, `normal`, `low`, `review`) son aceptados.
- [ ] El MCP permite crear y actualizar tareas con prioridad.
- [ ] La UI de captura (NewCaptureModal) incluye selector de prioridad.

#### 4.3.2 Indicador visual de diamante

**Estado actual**: Cada fila de tarea tiene un icono circular de status (circulo vacio = open, circulo con check = done) y un borde izquierdo con el color del espacio.

**Estado objetivo**: Se reemplaza el icono circular de status con un diamante (rombo de 10x10px, rotado 45 grados) relleno con el color de la prioridad. El borde izquierdo de color del espacio se elimina.

**Implementacion**:

```tsx
function PriorityDiamond({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#eab308',
    normal: '#3b82f6',
    low: '#22c55e',
    review: '#a855f7',
  }
  const color = colors[priority] || colors.normal
  return (
    <span style={{
      width: 10,
      height: 10,
      background: color,
      transform: 'rotate(45deg)',
      borderRadius: 2,
      flexShrink: 0,
    }} />
  )
}
```

**Criterios de aceptacion**:
- [ ] Cada fila de tarea muestra un diamante de 10x10px a la izquierda.
- [ ] El color del diamante corresponde a la prioridad de la tarea.
- [ ] El icono circular de status ya no aparece en la fila de tarea.
- [ ] El borde izquierdo de color del espacio ya no aparece en la fila de tarea.
- [ ] Los cinco colores de prioridad se mapean correctamente.

---

### 4.4 Fila de tarea rediseada

#### 4.4.1 Layout de la fila

**Estado actual**: La fila (`TaskRow`) muestra de izquierda a derecha:
1. Borde izquierdo (color del espacio)
2. StatusIcon (circulo)
3. TypeBadge (si no es "normal")
4. Titulo (flex, truncado) + TagPills
5. Initials del assignee (circulo con letras)
6. Fecha (createdAt o deadline)

**Estado objetivo**: La fila muestra de izquierda a derecha:
1. Diamante de prioridad (10x10, color segun prioridad)
2. Fecha de creacion en formato "DD mmm" (ej: "19 feb") -- texto muted, ancho fijo
3. Separador vertical (linea de 1px, altura 16px, color `var(--border)`)
4. Titulo/body de la tarea en **negrita** (font-weight 600), truncado con ellipsis
5. Nombre completo del responsable (o "--" si no hay), color `var(--text-tertiary)`, ancho fijo
6. Fecha limite (deadline) en formato "DD mmm", alineada a la derecha, o vacio si no hay

**Elementos eliminados de la fila**:
- StatusIcon (reemplazado por diamante de prioridad)
- TypeBadge (no aparece en el Figma)
- TagPills (no aparecen en el Figma)
- Initials (reemplazado por nombre completo)
- Borde izquierdo de color

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/components/TaskRow.tsx` -- reescritura completa.
- Nuevas props: `priority: string`.
- Props eliminadas: `type`, `tags`, `spaceColor`, `done`.
- Props modificadas: `assignee` ahora se muestra como texto completo, no como iniciales.

**Criterios de aceptacion**:
- [ ] Cada fila tiene exactamente 6 columnas visuales: diamante, fecha creacion, separador, titulo, responsable, deadline.
- [ ] El diamante de prioridad es el primer elemento, color segun la prioridad.
- [ ] La fecha de creacion se muestra en formato "DD mmm" (ej: "19 feb"), locale `es-CO`.
- [ ] Un separador vertical de 1px aparece entre la fecha y el titulo.
- [ ] El titulo esta en negrita (`font-weight: 600`), truncado con ellipsis si excede el espacio.
- [ ] El nombre del responsable se muestra completo (no iniciales). Si no hay responsable, se muestra "--".
- [ ] La fecha limite se muestra a la derecha en formato "DD mmm". Si no hay deadline, el espacio queda vacio.
- [ ] No hay badges de tipo, pills de tags, ni iconos circulares de status.
- [ ] No hay borde izquierdo de color.
- [ ] La fila tiene hover state con `var(--surface-hover)`.
- [ ] Cada fila es clickeable y navega a `/task/:id`.
- [ ] La altura de cada fila es consistente (~40px).

#### 4.4.2 Actualizacion de las paginas que usan TaskRow

Todas las paginas que renderizan `TaskRow` necesitan pasar la nueva prop `priority` y dejar de pasar las props eliminadas.

**Archivos afectados**:
- `/Users/angeltijaro/Dev/abeja/src/app/page.tsx` (homepage / futuro Inbox)
- `/Users/angeltijaro/Dev/abeja/src/app/tasks/page.tsx`
- Cualquier otra pagina que use `TaskRow` (buscar con grep).

**Criterios de aceptacion**:
- [ ] Ninguna pagina pasa `type`, `tags`, `spaceColor`, ni `done` a TaskRow.
- [ ] Todas las paginas pasan `priority` a TaskRow.
- [ ] El build de TypeScript compila sin errores despues de los cambios.

---

### 4.5 Vista de Inbox

#### 4.5.1 Nueva ruta `/inbox` (o reemplazo de `/`)

**Estado actual**: La pagina principal (`/`) muestra todas las tareas abiertas agrupadas por dominio y espacio, con expandible por espacio.

**Estado objetivo**: La pagina principal muestra la vista de Inbox: una lista plana de tareas (sin agrupacion por dominio/espacio), con las tres pestanas (Activas/Delegadas/Finalizadas), y el nuevo diseno de fila.

**Decision de ruta**: La ruta `/` se convierte en la vista de Inbox. La vista anterior (tareas agrupadas por dominio) se elimina o se mueve a `/overview`.

**Cambios requeridos**:
- Archivo: `/Users/angeltijaro/Dev/abeja/src/app/page.tsx` -- reescritura para mostrar Inbox.
- Query: obtener todas las tareas ordenadas por `createdAt desc`, con conteos por status.
- Incluir la relacion `space > domain` para tener acceso al contexto si se necesita.

**Header**: El header de la vista muestra "Inbox" con un chevron a la derecha (decorativo en v1, no funcional).

**Criterios de aceptacion**:
- [ ] La ruta `/` carga la vista de Inbox.
- [ ] El header muestra "Inbox" en `15px` semibold.
- [ ] Las tres pestanas (Activas/Delegadas/Finalizadas) aparecen debajo del header.
- [ ] La pestana Activas esta seleccionada por defecto.
- [ ] Las tareas se muestran en lista plana, sin agrupacion por dominio ni espacio.
- [ ] Las tareas se ordenan por fecha de creacion descendente.
- [ ] Si no hay tareas, se muestra un estado vacio apropiado.
- [ ] La busqueda de tareas sigue disponible (en la pagina `/tasks` completa).

---

### 4.6 Comportamiento responsivo

#### 4.6.1 Desktop (1280px+)

**Estado actual**: Sidebar fijo de 220px + contenido flexible. Funciona bien.

**Estado objetivo**: Sin cambios mayores. El sidebar se mantiene a 220px. Todas las columnas de la fila de tarea son visibles.

**Criterios de aceptacion**:
- [ ] Sidebar visible y fijo a 220px.
- [ ] Todas las columnas de la fila de tarea son visibles: diamante, fecha, separador, titulo, responsable, deadline.
- [ ] El contenido principal ocupa el espacio restante.

#### 4.6.2 Tablet (768px - 1279px)

**Estado actual**: El sidebar se oculta a 768px (breakpoint `md`). Se muestra un header movil con boton de hamburguesa.

**Estado objetivo**: El sidebar se mantiene visible en tablet (768px+). Las filas de tarea se adaptan truncando el titulo con ellipsis. El responsable y las fechas siguen visibles.

**Cambios requeridos**:
- El breakpoint de `md:flex` (768px) para el sidebar ya funciona. Confirmar que a 768px el layout no se rompe.
- Las columnas de ancho fijo (fecha, responsable) se mantienen. Solo el titulo se comprime.

**Criterios de aceptacion**:
- [ ] A 768px, el sidebar es visible y el contenido se muestra junto a el.
- [ ] Los titulos de tareas se truncan con ellipsis cuando el espacio es insuficiente.
- [ ] Las columnas de fecha de creacion, responsable y deadline siguen visibles.
- [ ] No hay overflow horizontal.

#### 4.6.3 Movil (< 768px)

**Estado actual**: El sidebar se oculta. Un header movil con hamburguesa abre un drawer de 280px con overlay. Funciona correctamente.

**Estado objetivo del Figma**: El Figma muestra el sidebar ocupando espacio significativo junto al contenido en movil (375px). **Esto es problematico**: a 375px un sidebar de 220px dejaria solo 155px de contenido, ilegible.

**Decision de producto**: Se **rechaza** el layout del Figma para movil. Se mantiene el patron actual de drawer (sidebar oculto + hamburguesa + overlay). El drawer ya existe y funciona bien. Razones:
1. 155px de contenido es ilegible.
2. El patron de drawer es estandar en mobile y ya esta implementado.
3. El drawer tiene animaciones y cierre correcto.

**Cambios menores para movil**:
- En la fila de tarea en movil, ocultar la columna de responsable y la fecha de creacion. Mostrar solo: diamante + titulo + deadline.
- Usar clases `hidden md:block` para las columnas opcionales.

**Criterios de aceptacion**:
- [ ] En movil (< 768px), el sidebar no es visible. Se accede via hamburguesa + drawer.
- [ ] El drawer mantiene el comportamiento actual (overlay, animacion, cierre al navegar).
- [ ] Las filas de tarea en movil muestran: diamante de prioridad, titulo (truncado), deadline.
- [ ] Las columnas de fecha de creacion y responsable se ocultan en movil.
- [ ] No hay overflow horizontal en 375px.
- [ ] El contenido principal ocupa el 100% del ancho en movil.

---

## 5. Cambios en el modelo de datos

### 5.1 Resumen de cambios al schema de Prisma

```prisma
model Task {
  id          Int            @id @default(autoincrement())
  spaceId     Int
  title       String?
  body        String
  tags        String[]
  status      String?        // Valores: 'active', 'delegated', 'done'
  priority    String         @default("normal")  // NUEVO: 'urgent', 'high', 'normal', 'low', 'review'
  deadline    DateTime?
  source      String?
  capRef      String?        @unique
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  completedAt DateTime?
  type        String         @default("normal")
  assignee    String?
  comments    Comment[]
  space       Space          @relation(fields: [spaceId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  documents   TaskDocument[]
}
```

### 5.2 Migracion requerida

```sql
-- Paso 1: Agregar campo priority
ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';

-- Paso 2: Migrar status 'open' a 'active'
UPDATE "Task" SET status = 'active' WHERE status = 'open';
```

### 5.3 Impacto en el MCP

| Operacion | Cambio |
|-----------|--------|
| `create_task` | Acepta `priority` (opcional, default `"normal"`). |
| `update_task` | Acepta `priority` (opcional). Acepta `status` con valor `"delegated"`. |
| `list_tasks` | Acepta `priority` como filtro. El filtro `status: 'open'` se mapea internamente a `'active'`. |
| `get_task` | Devuelve `priority` en la respuesta. |

### 5.4 Campos no modificados

Los siguientes campos de `Task` **no se eliminan** del schema aunque no se muestren en la UI de listado:
- `tags` -- se ocultan de la fila pero siguen existiendo como datos. Se usan en la vista de detalle.
- `type` -- se oculta de la fila pero sigue existiendo. Se usa para dispatch a agentes.
- `source` -- sin cambios.
- `capRef` -- sin cambios.

---

## 6. Componentes a crear o modificar

| Componente | Archivo | Accion | Descripcion |
|------------|---------|--------|-------------|
| `AppShell` | `src/components/AppShell.tsx` | Modificar | Logo, Inbox item, indicador de estado, icono de espacio, background |
| `TaskRow` | `src/components/TaskRow.tsx` | Reescribir | Nuevo layout: diamante, fecha, separador, titulo, responsable, deadline |
| `PriorityDiamond` | `src/components/TaskRow.tsx` (inline) | Crear | Componente de diamante de color segun prioridad |
| `InboxPage` | `src/app/page.tsx` | Reescribir | Vista de Inbox con tres pestanas y nuevo TaskRow |
| `TasksPage` | `src/app/tasks/page.tsx` | Modificar | Actualizar pestanas y TaskRow props |
| `RootLayout` | `src/app/layout.tsx` | Modificar | Agregar conteo de Inbox al sidebar data |
| `globals.css` | `src/app/globals.css` | Modificar | Agregar keyframe `pulse` para indicador de estado |
| `EnvelopeIcon` | `src/components/AppShell.tsx` (inline) | Crear | Icono SVG de sobre para Inbox |
| `SystemStatus` | `src/components/AppShell.tsx` (inline) | Crear | Indicador "Sistema Activo" |

---

## 7. Tokens de diseno (Design Tokens)

### 7.1 Colores existentes (sin cambio)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0a0a0a` | Background principal |
| `--surface` | `#131316` | Superficies elevadas |
| `--surface-hover` | `#1a1a1f` | Hover sobre superficies |
| `--border` | `#1e1e24` | Bordes |
| `--text` | `#e8e8ed` | Texto principal |
| `--text-secondary` | `#7e7e8c` | Texto secundario |
| `--text-tertiary` | `#4e4e56` | Texto terciario |
| `--accent` | `#C8F135` | Color de acento (lime green) |

### 7.2 Colores nuevos

| Token | Valor | Uso |
|-------|-------|-----|
| `--sidebar-bg` | `#111114` | Background del sidebar |
| `--priority-urgent` | `#ef4444` | Diamante: urgente |
| `--priority-high` | `#eab308` | Diamante: alta |
| `--priority-normal` | `#3b82f6` | Diamante: normal |
| `--priority-low` | `#22c55e` | Diamante: baja |
| `--priority-review` | `#a855f7` | Diamante: revision |
| `--status-active` | `#4ade80` | Punto de estado del sistema |

### 7.3 Tipografia (sin cambio global)

| Elemento | Size | Weight | Color |
|----------|------|--------|-------|
| Logo "ABEJA.CO" | 15px | 600 | `--accent` |
| Titulo de tarea (fila) | 14px | 600 | `--text` |
| Fecha en fila | 11px | 400 | `--text-tertiary` |
| Responsable en fila | 12px | 400 | `--text-tertiary` |
| Tab activo | 12px | 500 | `--text` |
| Tab inactivo | 12px | 400 | `--text-tertiary` |
| Conteo en tab | 12px | 400 | hereda del tab |

---

## 8. Fuera de alcance

Los siguientes elementos se identificaron en el analisis del Figma o en el modelo de datos pero **no se incluyen** en este PRD:

1. **Dropdown de selector de espacio en el header de Inbox**: El chevron junto a "Inbox" es decorativo en v1. Filtrar Inbox por espacio se pospone.
2. **Menu contextual del icono de tres puntos**: El icono se renderiza pero no tiene funcionalidad.
3. **Logica de delegacion automatica**: Este PRD agrega el estado `delegated` pero no automatiza la delegacion. La transicion `active -> delegated` es manual (via MCP o UI de detalle).
4. **Healthcheck real para "Sistema Activo"**: En v1 el indicador es estatico. La conexion a un endpoint de salud se aborda en v2.
5. **Rediseno de la vista de detalle de tarea** (`/task/:id`): Solo se redisena el listado.
6. **Rediseno del formulario de captura** (NewCaptureModal): Se agrega el selector de prioridad pero no se redisena el modal completo.
7. **Notificaciones en tiempo real / websockets para Inbox**: Inbox se actualiza al recargar la pagina.
8. **Selector de prioridad en la fila de tarea** (inline editing): La prioridad se cambia desde la vista de detalle, no desde la lista.
9. **Eliminacion de campos existentes** (`tags`, `type`) del schema: Se ocultan de la UI de listado pero los datos se preservan.
10. **Animaciones de transicion entre pestanas**: El cambio de pestana es un reload de pagina (server component). Las animaciones client-side se abordan en v2.

---

## 9. Dependencias y riesgos

### 9.1 Dependencias

| Dependencia | Descripcion | Riesgo si no se cumple |
|-------------|-------------|----------------------|
| Migracion de base de datos | El campo `priority` y la migracion de `open` a `active` deben ejecutarse antes de cualquier cambio de UI. | La UI no puede renderizar diamantes sin el campo. Las queries fallan si buscan `status = 'active'` pero los datos dicen `open`. |
| Actualizacion del MCP | El MCP debe aceptar los nuevos valores de status y el campo `priority` antes de que Angel o los agentes intenten usarlos. | Los agentes no pueden crear tareas con prioridad ni delegar tareas. |
| Datos de prueba con prioridad variada | El seed debe generar tareas con distintas prioridades para validar visualmente. | No se puede verificar que los colores de diamante son correctos. |
| Retrocompatibilidad del MCP | OpenClaw y otros agentes que usan el MCP actual podrian enviar `status: 'open'`. | Se rompe la creacion de tareas por agentes si no se maneja el alias. |

### 9.2 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| **Migracion de status rompe agentes**: Agentes que envian `status: 'open'` dejan de funcionar. | Alta | Alto | Implementar mapeo `open -> active` en la capa de API/MCP. Mantener el alias por al menos 30 dias. |
| **Perdida de informacion visual**: Al ocultar `type` y `tags` de la fila, usuarios pierden contexto. | Media | Medio | Los datos siguen en la vista de detalle. Si usuarios reportan perdida de contexto, se reconsideran tooltips o un modo "denso". |
| **Complejidad del conteo triple**: Tres queries `count` por carga de pagina (activas, delegadas, finalizadas) podrian afectar rendimiento. | Baja | Bajo | Usar una sola query agrupada con `groupBy` de Prisma en vez de tres queries separadas. |
| **Inconsistencia entre Figma movil y realidad**: El Figma sugiere un layout roto en 375px. | N/A (resuelta) | N/A | Se tomo la decision de rechazar el layout movil del Figma y conservar el drawer existente. Documentar la decision y comunicar al disenador. |
| **Concepto de "Inbox" ambiguo**: No esta claro si Inbox muestra todas las tareas activas del usuario, solo las no asignadas, o las asignadas a Angel. | Media | Alto | v1: Inbox muestra todas las tareas activas de todos los espacios. Si esto genera ruido, se itera con filtros. |

---

## 10. Plan de implementacion sugerido

Este plan no es prescriptivo pero sugiere un orden logico de ejecucion.

### Fase 1: Modelo de datos (prerequisito)
1. Agregar campo `priority` al schema de Prisma.
2. Crear y ejecutar migracion (campo + rename de `open` a `active`).
3. Actualizar seed con tareas de distintas prioridades.
4. Actualizar MCP con soporte para `priority` y `delegated`.
5. Agregar alias `open -> active` en MCP.

### Fase 2: Componentes base
1. Reescribir `TaskRow` con nuevo layout (diamante, columnas nuevas).
2. Crear `PriorityDiamond` como componente interno.
3. Actualizar todas las paginas que usan `TaskRow` para pasar las nuevas props.
4. Verificar que el build de TypeScript compila.

### Fase 3: Sidebar
1. Actualizar logo a "ABEJA.CO" en lime green.
2. Agregar item de Inbox con icono de sobre y badge.
3. Cambiar iconos de espacio de hexagono a circulo.
4. Agregar indicador "Sistema Activo" al fondo.
5. Cambiar background del sidebar a `#111114`.
6. Agregar CSS keyframe para pulso del punto verde.

### Fase 4: Vista de Inbox
1. Reescribir `page.tsx` (ruta `/`) como vista de Inbox.
2. Implementar tres pestanas con conteos.
3. Implementar subheader con icono de tres puntos.
4. Pruebas end-to-end del flujo completo.

### Fase 5: Responsivo
1. Verificar layout en 1280px+, 768px, y 375px.
2. Agregar clases `hidden md:block` a columnas opcionales en movil.
3. Verificar drawer en movil con los cambios de sidebar.
4. Pruebas en dispositivos reales o emuladores.

---

## 11. Criterios de aceptacion globales

Estos criterios aplican al rediseno completo, no a un feature individual.

- [ ] El build de produccion (`npm run build`) compila sin errores ni warnings.
- [ ] Los tests existentes (`npm run test`) pasan sin regresiones.
- [ ] La app se ve correctamente en Chrome, Safari, y Firefox (latest).
- [ ] No hay regresiones en la funcionalidad del MCP.
- [ ] La interfaz es exclusivamente en espanol (labels, placeholders, estados vacios).
- [ ] El tema oscuro se mantiene; no hay destellos de fondo blanco.
- [ ] La performance de la pagina principal (Inbox) es <= 2 segundos TTFB con 500 tareas en la base de datos.
- [ ] Lighthouse accessibility score >= 80 en la pagina de Inbox.
- [ ] Todos los elementos interactivos tienen `focus-visible` styling (ya existe globalmente).
- [ ] El favicon y metadata de la app no se modifican.

---

## Apendice A: Mapeo visual actual vs. Figma

| Elemento | Actual | Figma | Accion |
|----------|--------|-------|--------|
| Logo sidebar | "Abeja" texto blanco | "ABEJA.CO" lime green | Cambiar texto y color |
| Nav items sidebar | Inicio, Tareas | Inbox (con badge) | Reemplazar Inicio con Inbox |
| Iconos de espacio | Hexagono stroke | Circulo relleno | Cambiar componente |
| Status indicator | No existe | "Sistema Activo" + punto verde | Crear nuevo |
| Sidebar background | `#131316` | `#111114` | Oscurecer |
| Tabs de status | Abiertas / Completadas / Todas | Activas / Delegadas / Finalizadas | Reemplazar |
| Fila: icono status | Circulo vacio/check | Diamante de prioridad | Reemplazar |
| Fila: type badge | Badge de tipo | No existe | Eliminar de fila |
| Fila: tag pills | Pills de tags | No existe | Eliminar de fila |
| Fila: assignee | Iniciales (circulo) | Nombre completo texto | Cambiar display |
| Fila: titulo | Font-weight normal | Font-weight 600 (bold) | Actualizar |
| Fila: fecha creacion | No aparece | Columna dedicada | Agregar |
| Fila: separador | No existe | Linea vertical 1px | Agregar |
| Fila: borde izquierdo | Color del espacio | No existe | Eliminar |
| Concepto de prioridad | No existe | Diamante de 5 colores | Crear campo + UI |
| Concepto de delegacion | No existe | Status "delegated" + tab | Crear status + tab |
| Movil: sidebar | Drawer 280px | Sidebar comprimida (rechazado) | Mantener drawer |

---

## Apendice B: Referencia de colores de prioridad

```
  urgent   #ef4444  ████  Rojo      — Atencion inmediata
  high     #eab308  ████  Amarillo  — Importante, pronto
  normal   #3b82f6  ████  Azul      — Estandar (default)
  low      #22c55e  ████  Verde     — Puede esperar
  review   #a855f7  ████  Morado    — Requiere revision
```
