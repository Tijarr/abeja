# PRD: Recurring Task Types

**Fecha**: 2026-02-26
**Autor**: Angel Tijaro (Product Owner)
**Estado**: Draft
**Version**: v1

---

## 1. Executive Summary

### Que es

Extender el modelo de TaskType en Abeja para soportar dos modos de scheduling: **manual** (comportamiento actual) y **recurring** (cron-scheduled). Los task types recurrentes auto-crean instancias de Task basandose en una expresion cron, eliminando la necesidad de que Angel recuerde y cree tareas repetitivas.

### Por que

Principio #1 de Abeja: **reducir carga mental**. Principio #2: **identificar oportunidades de automatizacion**. Hoy, si Angel necesita calcular nomina cada mes, tiene que recordar crear la tarea. Con recurring task types, el sistema absorbe esa responsabilidad. Esto es el paso natural en la evolucion `manual -> tipo -> automatizado` que define la filosofia del proyecto.

### Para quien

- **Angel** — deja de perseguir tareas repetitivas.
- **Agentes IA (via MCP)** — pueden crear y gestionar recurring task types programaticamente.

---

## 2. Feature Specs

### 2.1 TaskType Configuration

El modelo `TaskType` se extiende con los siguientes campos:

| Campo | Tipo | Requerido | Default | Descripcion |
|-------|------|-----------|---------|-------------|
| `mode` | enum: `manual`, `recurring` | si | `manual` | Modo de scheduling |
| `cronExpression` | string | solo si `mode=recurring` | — | Expresion cron de 5 campos |
| `targetSpaceId` | int (FK a Space) | solo si `mode=recurring` | — | Space donde se crean las tasks |
| `defaultAssignee` | string | no | null | Responsable por defecto de tasks generadas |
| `defaultPriority` | enum: `low`, `medium`, `high`, `urgent` | no | `medium` | Prioridad por defecto |
| `defaultTags` | string[] | no | [] | Tags por defecto |
| `titleTemplate` | string | no | `"{name} — {date}"` | Template para el titulo de tasks generadas |
| `isActive` | boolean | si | true | Si el cron esta activo o pausado |
| `timezone` | string | no | `America/Bogota` | Timezone para evaluar el cron |
| `lastRunAt` | datetime | no | null | Ultima vez que se ejecuto el cron |
| `nextRunAt` | datetime | no | null | Proxima ejecucion calculada |

### 2.2 Scheduling Modes

**Manual** (`mode = "manual"`):
- Comportamiento actual. No tiene cron. El usuario crea tasks de este tipo cuando quiere.
- Campos de cron (`cronExpression`, `targetSpaceId`, `isActive`, etc.) son ignorados.

**Recurring** (`mode = "recurring"`):
- Requiere `cronExpression` y `targetSpaceId`.
- El sistema evalua el cron y auto-crea tasks en el space indicado.
- Se puede pausar/reanudar con `isActive`.

### 2.3 Cron Expression

Formato estandar de 5 campos:

```
┌───────────── minuto (0-59)
│ ┌───────────── hora (0-23)
│ │ ┌───────────── dia del mes (1-31)
│ │ │ ┌───────────── mes (1-12)
│ │ │ │ ┌───────────── dia de la semana (0-7, 0 y 7 = domingo)
│ │ │ │ │
* * * * *
```

**Presets disponibles en UI:**

| Preset | Expresion | Descripcion |
|--------|-----------|-------------|
| Diario | `0 9 * * *` | Todos los dias a las 9am |
| Semanal | `0 9 * * 1` | Cada lunes a las 9am |
| Bisemanal | `0 9 1,15 * *` | Dias 1 y 15 de cada mes a las 9am |
| Mensual | `0 9 1 * *` | Primer dia de cada mes a las 9am |
| Trimestral | `0 9 1 1,4,7,10 *` | Primer dia de cada trimestre a las 9am |
| Anual | `0 9 1 1 *` | 1 de enero a las 9am |

Los presets son atajos. El usuario siempre puede editar la expresion raw.

### 2.4 Title Template Variables

El `titleTemplate` soporta las siguientes variables que se resuelven al momento de crear la task:

| Variable | Ejemplo de salida | Descripcion |
|----------|-------------------|-------------|
| `{name}` | Calcular nomina | Nombre del TaskType |
| `{date}` | 2026-03-01 | Fecha ISO de la ejecucion |
| `{day}` | 01 | Dia del mes (2 digitos) |
| `{month}` | 03 | Mes numerico (2 digitos) |
| `{monthName}` | Marzo | Nombre del mes en espanol |
| `{year}` | 2026 | Ano (4 digitos) |
| `{week}` | 09 | Numero de semana ISO |
| `{quarter}` | Q1 | Trimestre |

**Ejemplo**: `"Nomina {monthName} {year}"` genera `"Nomina Marzo 2026"`.

### 2.5 Auto-Task Creation

Cuando el cron se dispara, el sistema crea una Task con:

| Campo de Task | Valor |
|---------------|-------|
| `spaceId` | `targetSpaceId` del TaskType |
| `title` | Template resuelto con variables de fecha |
| `body` | `instructions` del TaskType (o vacio si no tiene) |
| `type` | `name` del TaskType |
| `assignee` | `defaultAssignee` del TaskType |
| `tags` | `defaultTags` del TaskType |
| `status` | `"open"` |
| `source` | `"recurring:{taskTypeId}"` |
| `deadline` | null (v1 — futuro: calcular segun siguiente ejecucion) |

Despues de crear la task, el sistema actualiza `lastRunAt` y recalcula `nextRunAt`.

### 2.6 Pause / Resume

- `isActive = true`: el cron se evalua normalmente.
- `isActive = false`: el cron no se evalua. No se crean tasks. `nextRunAt` se muestra como "Pausado".
- Al reanudar (`isActive` de false a true), se recalcula `nextRunAt` desde el momento actual. **No se crean tasks retroactivas** por el periodo pausado.

### 2.7 History

Cada task generada por un recurring type se identifica por `source = "recurring:{taskTypeId}"`. La UI permite ver el historial de tasks generadas por un tipo, ordenadas por fecha de creacion.

---

## 3. Schema Changes (Prisma)

```prisma
model TaskType {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  instructions    String?
  tools           Json?
  structure       Json?
  mode            String    @default("manual")  // "manual" | "recurring"
  cronExpression  String?
  targetSpaceId   Int?
  defaultAssignee String?
  defaultPriority String?   @default("medium")
  defaultTags     String[]
  titleTemplate   String?   @default("{name} — {date}")
  isActive        Boolean   @default(true)
  timezone        String    @default("America/Bogota")
  lastRunAt       DateTime? @db.Timestamptz(6)
  nextRunAt       DateTime? @db.Timestamptz(6)
  createdAt       DateTime  @default(now()) @db.Timestamptz(6)
  targetSpace     Space?    @relation(fields: [targetSpaceId], references: [id], onDelete: SetNull)
}
```

Y en `Space`:

```prisma
model Space {
  // ... campos existentes
  taskTypes   TaskType[]
}
```

---

## 4. Acceptance Criteria

### User Story 1: Crear recurring task type

> Como Angel, quiero crear un recurring task type con cron schedule para que las tasks se creen automaticamente.

- [ ] AC1.1: Puedo crear un TaskType con `mode = "recurring"`, un `cronExpression` valido y un `targetSpaceId`.
- [ ] AC1.2: El sistema valida que la expresion cron tiene 5 campos y es parseable.
- [ ] AC1.3: El sistema calcula y muestra `nextRunAt` al guardar.
- [ ] AC1.4: Si `mode = "recurring"` pero falta `cronExpression` o `targetSpaceId`, el sistema muestra error de validacion.
- [ ] AC1.5: Puedo usar un preset (diario, semanal, etc.) que autocompleta la expresion cron.

### User Story 2: Ver recurring task types y proxima ejecucion

> Como Angel, quiero ver cuales task types son recurrentes y cuando se ejecutan proximo.

- [ ] AC2.1: La lista de task types muestra un indicador visual de si es manual o recurring.
- [ ] AC2.2: Para task types recurring, se muestra `nextRunAt` en formato legible (ej. "1 Mar 2026, 9:00am").
- [ ] AC2.3: Para task types recurring, se muestra `lastRunAt` si existe.
- [ ] AC2.4: Los recurring task types pausados muestran indicador de "Pausado" en vez de `nextRunAt`.

### User Story 3: Pausar y reanudar

> Como Angel, quiero pausar/reanudar recurring task types sin eliminarlos.

- [ ] AC3.1: Puedo togglear `isActive` desde la UI con un solo clic/switch.
- [ ] AC3.2: Al pausar, el cron deja de dispararse inmediatamente.
- [ ] AC3.3: Al reanudar, `nextRunAt` se recalcula desde el momento actual (sin retroactivos).
- [ ] AC3.4: El estado (activo/pausado) se persiste y sobrevive restarts del servidor.

### User Story 4: Auto-creacion de tasks con defaults

> Como Angel, quiero que las tasks auto-creadas tengan los defaults correctos.

- [ ] AC4.1: La task creada tiene el `spaceId`, `type`, `assignee`, `tags` del TaskType.
- [ ] AC4.2: El titulo se genera desde el `titleTemplate` con las variables de fecha resueltas.
- [ ] AC4.3: El `source` de la task es `"recurring:{taskTypeId}"`.
- [ ] AC4.4: La task se crea con `status = "open"`.
- [ ] AC4.5: `lastRunAt` se actualiza en el TaskType despues de crear la task.

### User Story 5: Historial de tasks generadas

> Como Angel, quiero ver el historial de tasks generadas por un recurring type.

- [ ] AC5.1: En el detalle de un TaskType recurring, hay una seccion "Historial" que lista tasks con `source = "recurring:{id}"`.
- [ ] AC5.2: El historial esta ordenado por `createdAt` descendente (mas reciente primero).
- [ ] AC5.3: Cada entrada muestra titulo, status, fecha de creacion y assignee.
- [ ] AC5.4: Puedo hacer clic en una task del historial para ir a su detalle.

### User Story 6: Gestion via MCP

> Como agente IA, quiero crear y gestionar recurring task types via MCP.

- [ ] AC6.1: Nuevo tool MCP `create_task_type(name, mode, cronExpression?, targetSpaceId?, ...)`.
- [ ] AC6.2: Nuevo tool MCP `update_task_type(id, ...)` para modificar campos incluyendo `isActive`.
- [ ] AC6.3: Nuevo tool MCP `list_task_types(mode?)` para listar types, filtrable por modo.
- [ ] AC6.4: Nuevo tool MCP `get_task_type(id)` que retorna detalle incluyendo historial de tasks generadas.
- [ ] AC6.5: Los tools validan los mismos constraints que la UI (cron valido, spaceId existente, etc.).

---

## 5. UI Requirements

### 5.1 Task Types Page

**Ruta**: `/task-types` (nueva pagina en el sidebar, debajo de la navegacion principal).

- Lista de todos los task types en cards o tabla.
- Cada entry muestra: nombre, modo (badge: "Manual" o "Recurrente"), estado (activo/pausado), proxima ejecucion, space destino.
- Boton "Nuevo tipo de tarea" que abre modal/formulario.
- Filtros: todos, solo manuales, solo recurrentes.

### 5.2 Crear/Editar Task Type (Modal o Page)

**Campos del formulario:**

1. **Nombre** — text input, requerido.
2. **Modo** — toggle o radio: Manual / Recurrente.
3. **Instrucciones** — textarea (existente, para agentes).
4. **--- Seccion Recurrencia (visible solo si modo = Recurrente) ---**
5. **Schedule** — selector de preset (Diario, Semanal, Bisemanal, Mensual, Trimestral, Anual) + campo de expresion cron raw editable. El preset llena el campo; el campo siempre es editable.
6. **Space destino** — dropdown de spaces existentes, requerido en modo recurrente.
7. **Template de titulo** — text input con placeholder mostrando variables disponibles. Default: `"{name} — {date}"`.
8. **Responsable por defecto** — text input (autocomplete si hay assignees conocidos).
9. **Prioridad por defecto** — dropdown: Baja, Media, Alta, Urgente.
10. **Tags por defecto** — tag input.
11. **Timezone** — dropdown, default America/Bogota. Solo mostrar si el usuario expande "Opciones avanzadas".

**Preview**: debajo del formulario, mostrar "Proxima ejecucion: {fecha calculada}" en tiempo real al cambiar el cron.

### 5.3 Indicadores Visuales

- **Recurring activo**: icono de reloj/loop con color verde + badge "Recurrente".
- **Recurring pausado**: mismo icono pero gris/apagado + badge "Pausado".
- **Manual**: sin icono especial, badge "Manual" sutil.

### 5.4 Detalle de Task Type

Al hacer clic en un task type recurring, se muestra:

- Info general (nombre, instrucciones, config del cron).
- **Proxima ejecucion** destacada.
- **Ultima ejecucion** con link a la task generada.
- **Historial** — tabla/lista de tasks generadas, con titulo, status, fecha, assignee. Paginada si hay muchas.
- Botones: Editar, Pausar/Reanudar, Eliminar.

### 5.5 Integracion con Task View

- En el detalle de una Task que fue generada por recurrencia, mostrar un badge/link: "Generada por: {nombre del TaskType}".
- El campo `source` ya contiene esta referencia.

---

## 6. Edge Cases

### 6.1 Task pendiente cuando llega la siguiente ejecucion

**Escenario**: "Calcular nomina" de febrero sigue en status "open" cuando llega el 1 de marzo.

**Decision**: Se crea la nueva task de marzo igualmente. Las tasks son independientes. Tener una task pendiente no bloquea la creacion de la siguiente. En la UI, si hay mas de una task open del mismo tipo recurrente, se muestra un indicador de "2 pendientes" para llamar la atencion de Angel.

### 6.2 Missed runs (server down o task type pausado)

**Decision v1**: No se crean tasks retroactivas. Si el servidor estuvo caido el 1 de marzo y vuelve el 2, la task de marzo no se crea automaticamente. Se espera a la siguiente ejecucion programada (1 de abril).

**Razon**: Simplicidad. Crear retroactivos genera confusion. Si Angel nota que falta una task, puede crearla manualmente.

**Futuro**: Opcion configurable de "catch-up" que cree una task al detectar que se perdio una ejecucion (maximo 1 retroactiva).

### 6.3 Timezone

- Cada TaskType tiene su `timezone` (default: `America/Bogota`).
- El cron se evalua en ese timezone.
- `nextRunAt` y `lastRunAt` se almacenan en UTC (timestamptz) pero se muestran en el timezone del TaskType.
- Cambios de horario (DST) se manejan automaticamente por la libreria de cron.

### 6.4 Target space eliminado

**Decision**: Si el space destino se elimina, el TaskType se pausa automaticamente (`isActive = false`). `nextRunAt` se limpia. En la UI se muestra un warning: "Space destino eliminado. Selecciona otro space para reactivar."

### 6.5 Crons muy frecuentes

**Decision**: Frecuencia minima permitida es **1 vez por hora**. Expresiones que resuelvan a mas de 24 ejecuciones diarias se rechazan con error de validacion.

**Validacion**: Al guardar, calcular las proximas 24 horas de ejecuciones. Si son mas de 24, rechazar.

**Razon**: Abeja es un sistema de despacho de tareas humanas. No tiene sentido crear una task cada minuto. Si se necesita algo asi, pertenece al sistema de operacion del producto, no a Abeja.

### 6.6 Nombre duplicado

- `TaskType.name` ya tiene constraint `@unique`. Aplicar normalmente.

### 6.7 Editar cron de un task type activo

- Al cambiar `cronExpression`, se recalcula `nextRunAt` inmediatamente.
- Tasks ya generadas no se afectan.

### 6.8 Eliminar un recurring task type

- Se elimina el TaskType.
- Las tasks generadas previamente permanecen (son entidades independientes).
- El campo `source` de esas tasks queda como referencia historica.

---

## 7. Cron Execution Strategy

### v1: Next.js Cron Route + Vercel Cron

Abeja corre en Vercel. La estrategia para v1:

1. **Cron route**: `GET /api/cron/recurring-tasks` — endpoint protegido por token (`CRON_SECRET`).
2. **Vercel Cron**: configurar en `vercel.json` para ejecutar cada hora (o cada 15 minutos).
3. **Logica del endpoint**:
   - Consultar todos los TaskTypes con `mode = "recurring"`, `isActive = true`, y `nextRunAt <= now()`.
   - Para cada uno, crear la Task con los defaults configurados.
   - Actualizar `lastRunAt = now()` y recalcular `nextRunAt`.
   - Log de ejecucion.

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/recurring-tasks",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Implicacion**: La precision maxima del cron es de 15 minutos. Una task programada para las 9:00 puede crearse entre 9:00 y 9:14. Aceptable para v1.

### Futuro: Worker dedicado

Si la frecuencia o precision necesitan mejorar, migrar a un worker (ej. Inngest, Trigger.dev, o cron de Railway) que evalua cada minuto.

---

## 8. MCP API

Nuevos tools para el MCP server:

### `list_task_types`

```
Input:  { mode?: "manual" | "recurring", active?: boolean }
Output: TaskType[]
```

### `get_task_type`

```
Input:  { id: number }
Output: TaskType con historial de tasks generadas (ultimas 20)
```

### `create_task_type`

```
Input: {
  name: string,
  mode?: "manual" | "recurring",
  instructions?: string,
  cronExpression?: string,
  targetSpaceId?: number,
  defaultAssignee?: string,
  defaultPriority?: "low" | "medium" | "high" | "urgent",
  defaultTags?: string[],
  titleTemplate?: string,
  timezone?: string
}
Output: TaskType creado
```

### `update_task_type`

```
Input: {
  id: number,
  ...campos opcionales (mismos que create)
  isActive?: boolean  // para pause/resume
}
Output: TaskType actualizado
```

### `delete_task_type`

```
Input:  { id: number }
Output: { success: true }
```

---

## 9. Out of Scope (v1)

- **Catch-up de missed runs**: no se crean tasks retroactivas por ejecuciones perdidas.
- **Dependencias entre tasks**: una recurring task no espera a que la anterior este completada.
- **Deadline automatico**: no se calcula deadline basado en la siguiente ejecucion.
- **Notificaciones**: no se envian alertas cuando se crea una task recurrente (futuro: webhook, email, WhatsApp).
- **Cron sub-horario**: frecuencia minima 1 hora para crons. Precision de 15 minutos por Vercel Cron.
- **Multi-task por ejecucion**: cada ejecucion crea exactamente 1 task. No subtasks ni batches.
- **UI de logs de ejecucion del cron**: solo se registra `lastRunAt`. No hay log detallado de cada run.
- **Recurrencia delegada a productos**: los crons viven en Abeja, no en cada producto (alineado con roadmap futuro).

---

## 10. Example Recurring Task Types

| Nombre | Cron | Preset | Space | Assignee | Title Template | Tags |
|--------|------|--------|-------|----------|---------------|------|
| Calcular nomina | `0 9 1 * *` | Mensual | Nomina | Ana Lopez | `Nomina {monthName} {year}` | `nomina`, `finanzas` |
| Publicar articulo blog | `0 9 * * 1` | Semanal | Blog | — | `Articulo semana {week} — {year}` | `contenido`, `blog` |
| Revision de seguridad | `0 9 1 1,4,7,10 *` | Trimestral | Nodo IA | Roberto Diaz | `Revision seguridad {quarter} {year}` | `seguridad`, `auditoria` |
| Backup de base de datos | `0 2 * * *` | Diario | Automatizacion | — | `Backup BD {date}` | `backup`, `infra` |
| Reporte de metricas | `0 9 * * 1` | Semanal | Analisis | — | `Metricas semana {week}` | `metricas`, `reporte` |

---

## 11. Success Metrics

- **Adopcion**: Angel crea al menos 5 recurring task types en el primer mes.
- **Reduccion de carga**: Disminucion medible de tasks creadas manualmente que antes eran repetitivas.
- **Fiabilidad**: 100% de cron executions exitosas (ninguna task perdida por error del sistema).
- **MCP**: Al menos 1 agente usa los tools de recurring task types.

---

## 12. Implementation Phases

### Phase 1: Schema + Backend (1-2 dias)
- Migrar schema de Prisma (nuevos campos en TaskType, FK a Space).
- Crear cron route `/api/cron/recurring-tasks`.
- Logica de creacion de tasks con template resolution.
- Validacion de cron expressions.
- Tests unitarios.

### Phase 2: MCP (0.5 dias)
- Agregar tools al MCP server: `list_task_types`, `get_task_type`, `create_task_type`, `update_task_type`, `delete_task_type`.
- Tests de integracion.

### Phase 3: UI (1-2 dias)
- Pagina `/task-types` con lista.
- Modal/formulario de crear/editar con presets de cron.
- Detalle con historial.
- Toggle pause/resume.
- Badge en tasks generadas.

### Phase 4: Deploy + Vercel Cron (0.5 dias)
- Configurar `vercel.json` con cron schedule.
- Variable de entorno `CRON_SECRET`.
- Verificar en produccion.

**Total estimado: 3-5 dias.**
