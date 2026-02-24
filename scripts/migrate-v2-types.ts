/**
 * Paso 2: Data migration — v1 types → v2 primitives
 * 
 * Mapping:
 *   creencia  → fact  (structural, subtype: creencia)
 *   reflexion → fact  (signal, subtype: reflexion)
 *   regla     → fact  (structural, subtype: regla)
 *   task      → tarea
 *   idea      → idea  (unchanged)
 *   referencia→ referencia (unchanged)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Paso 2: Data Migration v1 → v2 ===\n')

  // 1. creencia → fact (structural)
  const creencias = await prisma.capture.updateMany({
    where: { type: 'creencia' },
    data: {
      type: 'fact',
      rooting: 'structural',
      metadata: { subtype: 'creencia' },
    },
  })
  console.log(`✅ creencia → fact [structural]: ${creencias.count}`)

  // 2. reflexion → fact (signal)
  const reflexiones = await prisma.capture.updateMany({
    where: { type: 'reflexion' },
    data: {
      type: 'fact',
      rooting: 'signal',
      metadata: { subtype: 'reflexion' },
    },
  })
  console.log(`✅ reflexion → fact [signal]:    ${reflexiones.count}`)

  // 3. regla → fact (structural)
  const reglas = await prisma.capture.updateMany({
    where: { type: 'regla' },
    data: {
      type: 'fact',
      rooting: 'structural',
      metadata: { subtype: 'regla' },
    },
  })
  console.log(`✅ regla → fact [structural]:    ${reglas.count}`)

  // 4. task → tarea
  const tasks = await prisma.capture.updateMany({
    where: { type: 'task' },
    data: { type: 'tarea' },
  })
  console.log(`✅ task → tarea:                 ${tasks.count}`)

  // 5. idea, referencia: no change needed
  console.log(`ℹ️  idea, referencia: no changes`)

  // Verify
  console.log('\n=== Verificación final ===')
  const result = await prisma.capture.groupBy({ by: ['type'], _count: true })
  result.forEach(r => console.log(`  ${r.type}: ${r._count}`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
