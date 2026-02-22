# Concepts — Abeja / Diseño

### [2026-02-21 23:15] cap-152
- **Type**: concept
- **Content**: Ontología v3 — 3 capas: Forma (SQL estructura), Tipo Epistemológico (semántica del objeto), Relación (conexiones). Jerarquía: Dominio → Workspace → Objeto → Conexiones → Eventos.

### [2026-02-21 22:42] cap-153
- **Type**: assertion
- **Content**: Abeja no es organizador. Es consciencia compartida. Flujo: Angel vomita pensamientos → Abeja clasifica + conecta → Agentes ejecutan → Sistema recuerda TODO.

### [2026-02-21 23:00] cap-154
- **Type**: concept
- **Content**: 11 tipos epistemológicos core: Tarea, Idea, Nota, Decisión, Meta, Pregunta, Regla, Recurso, Documento, Fracaso, Persona. Todos extensibles con custom types.

### [2026-02-21 23:00] cap-155
- **Type**: assertion
- **Content**: El tipo epistemológico NO es decoración — es instrucción de lectura para el agente. Skill "investigar" busca Preguntas + Referencias. Skill "redactar" busca Decisiones + Fracasos.

### [2026-02-21 22:00] cap-156
- **Type**: concept
- **Content**: Ingesta multi-objeto: un mensaje puede generar múltiples objetos. Skill ingesta.reduce descompone + clasifica. Skill ingesta.reflect lee workspace completo → conexiones semánticas.

### [2026-02-21 22:30] cap-157
- **Type**: concept
- **Content**: Workspace = contexto completo para agente (briefing folder). 90% conocimiento, 10% tareas. Sin contexto = agente genérico. Con contexto = agente que conoce reglas, preferencias, fracasos.

### [2026-02-21 22:45] cap-158
- **Type**: concept
- **Content**: Ciclo de vida tareas: recibida → en_ejecución → esperando_humano → completada → fallida. Tareas = instrucciones para agentes, NO to-dos para Angel.

### [2026-02-21 23:15] cap-159
- **Type**: concept
- **Content**: Storage pattern: Abeja guarda REFERENCIA a archivo, no archivo completo. Default: Google Drive. Conexión "adjunta" con metadata (tipo, size, última actualización).

### [2026-02-21 22:00] cap-160
- **Type**: assertion
- **Content**: Abeja = cerebro, NO manos. No reemplaza herramientas, las referencia.

### [2026-02-21 23:42] cap-161
- **Type**: assertion
- **Content**: "Para automatizar tengo que tener un repo de conocimiento y una manera fácil de hacerle ingesta." — Angel

### [2026-02-21 22:00] cap-162
- **Type**: concept
- **Content**: 6 tablas PostgreSQL: dominios, workspaces, tipos, objetos, conexiones, eventos. Multi-usuario futuro con tenant_id + RLS.

### [2026-02-21 22:00] cap-163
- **Type**: assertion
- **Content**: ADR-013: Abeja se usa para construir Abeja (bootstrapping).

### [2026-02-21 22:00] cap-164
- **Type**: concept
- **Content**: 3 capas incrementales: Capa 1 (datos + UI), Capa 2 (clasificación automática con LLM), Capa 3 (agentes autónomos + event sourcing + learned preferences).

### [2026-02-21 22:00] cap-165
- **Type**: concept
- **Content**: Validación de arquitectura por 3 fuentes independientes: Ars Contexta (grafo de claims), Koylan Personal Brain OS (progressive disclosure), Angel+Abeja (context engine). Las 3 convergen en: grafo > lista, tipos semánticos = instrucciones.

### [2026-02-21 22:00] cap-166
- **Type**: assertion
- **Content**: Analogía biológica de Angel: Hueso (forma/SQL) + Músculo (tipo semántico) + Órgano (workspace).

### [2026-02-21 22:00] cap-167
- **Type**: assertion
- **Content**: "Diseñar es dar sentido, dar significado" — Angel

### [2026-02-21 22:00] cap-168
- **Type**: concept
- **Content**: Interfaces v3: 12 pantallas. Estilo: negro puro + blanco + Inter font. Sin emojis. Referente: Linear. Ingesta = pantalla más prominente.

### [2026-02-21 22:00] cap-169
- **Type**: concept
- **Content**: Nuevas conexiones: se_ejecuta_en (tarea→workspace), se_verifica_en (recurso→workspace), adjunta (objeto→documento), usa_template (tarea→tarea plantilla).

### [2026-02-22 08:41] cap-170
- **Type**: concept
- **Content**: Abeja como diseñador de contextos. Taxonomía refinada: Domain → Space → Task. Skills transversales. Knowledge con event sourcing. Assertions como factos atómicos con metadata (source, confidence, timestamp).

### [2026-02-22 08:48] cap-171
- **Type**: concept
- **Content**: Skill "Curator" — skill transversal especializado en metadata. Observa interacciones y refina metadata automáticamente.

### [2026-02-22 09:07] cap-172
- **Type**: concept
- **Content**: MVP Abeja = skill de OpenClaw (no app, no plataforma). Captura → Clasifica (tipo + domain + space) → Almacena (markdown) → Confirma → Permite corrección.

### [2026-02-22 08:54] cap-173
- **Type**: concept
- **Content**: Contexto se construye a partir de assertions (factos atómicos). Knowledge graph basado en assertions. Los docs pueden generarse DESDE assertions, no al revés. Contradicciones detectables.

### [2026-02-22 09:09] cap-174
- **Type**: assertion
- **Content**: La ironía: necesitas Abeja para poder construir Abeja. Sin sistema de captura, las ideas secuestran porque si no las persigues se pierden.
