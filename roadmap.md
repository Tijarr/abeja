# Abeja — Roadmap

## Versiones

### v1 — Captures (completada)
Primera version. Modelo de datos: Domain → Space → Capture. Captures tenian tipos (fact, idea, tarea, referencia). UI basica con sidebar, lista de capturas, filtros. Auth por password.

### v2 — Types (completada)
Normalizacion de tipos de captura. Script de migracion para unificar valores. Seed desde markdown.

### v3 — Flatten (completada)
Simplificacion radical. Se elimina Domain como capa. Se renombra Capture a Task. Solo queda Space → Task. Se eliminan tipos (fact, idea, referencia). Todo es task. Se agregan comentarios en UI, contactos por space, acciones de tarea (completar, eliminar). Deploy en Vercel + Neon.

### v4 — Dispatch (en curso)
Evolucion hacia sistema de despacho de tareas para agentes.

Cambios:
- Restaurar Domain → Space → Task (tres niveles de organizacion)
- Agregar tipo de tarea (field `type`, default "normal")
- Agregar responsable (field `assignee`, nullable)
- Crear modelo TaskType (instrucciones, herramientas, estructura por tipo)
- Documentos como entidad separada (Document + TaskDocument)
- MCP server para agentes (list, create, update tasks, comments, documents, contacts)
- principles.md y roadmap.md

---

## Pendiente (proximo)

### MCP + Agente
- [ ] Conectar agente IA (OpenClaw/Claude) al MCP
- [ ] Flujo WhatsApp → Agente → MCP → Abeja
- [ ] Agente clasifica automaticamente: space, tipo, si es comentario o task nueva

### Task Types evolucion
- [ ] UI para crear/editar tipos de tarea
- [ ] Instrucciones por tipo (texto libre que el agente lee)
- [ ] Herramientas por tipo (lista de tools/MCPs que el agente puede usar)
- [ ] Deteccion de patrones: "esta tarea se parece a X, deberia ser tipo Y?"

### Documentos
- [ ] Storage real (S3 o Supabase Storage)
- [ ] Integracion con Google Drive
- [ ] Preview de documentos en UI
- [ ] Agente puede subir/consultar documentos

### Contactos
- [ ] Integracion con contactos del telefono
- [ ] Agente puede consultar contactos por space
- [ ] Contactos con metadata enriquecida (notas, historial)

---

## Futuro (cuando madure)

- [ ] Hub por space: contexto completo para agentes operadores
- [ ] MCPs especializados por space (tools, docs, permisos propios)
- [ ] Formalizacion de "la fabrica" como pipeline de construccion de software
- [ ] Dashboard de agentes: que agente opera que space, logs de acciones
- [ ] Recurrencia delegada: crons que viven en cada producto, no en Abeja
