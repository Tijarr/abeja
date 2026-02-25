/**
 * v3 Migration: Domain/Space/Capture → Space/Task
 * Uses raw SQL via Prisma's $queryRawUnsafe / $executeRawUnsafe
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DOMAIN_COLORS = {
  finca: '#6bc9a0',
  vecino: '#d4636c',
  canticuento: '#bb87fc',
  personal: '#e07eb4',
  familia: '#4ea8db',
  abeja: '#e8ab5e',
  sandbox: '#8b9ab0',
  govtech: '#6bc9a0',
  diseno: '#d4a0e0',
}

const SLUG_MAP = {
  'finca/pajarillo': { slug: 'pajarillo', name: 'Pajarillo' },
  'finca/legal': { slug: 'finca-legal', name: 'Finca Legal' },
  'vecino/editorial': { slug: 'vecino-editorial', name: 'Vecino Editorial' },
  'vecino/producto': { slug: 'vecino-producto', name: 'Vecino Producto' },
  'vecino/republica-malandra': { slug: 'republica-malandra', name: 'República Malandra' },
  'canticuento/cuentos': { slug: 'canticuento', name: 'Canticuento' },
  'canticuento/producto': { slug: 'canticuento-producto', name: 'Canticuento Producto' },
  'personal/crecimiento': { slug: 'personal', name: 'Personal' },
  'personal/maximas': { slug: 'maximas', name: 'Máximas' },
  'personal/blog': { slug: 'blog', name: 'Blog' },
  'familia/hijos': { slug: 'familia-hijos', name: 'Familia Hijos' },
  'familia/hogar': { slug: 'familia-hogar', name: 'Familia Hogar' },
  'abeja/diseño': { slug: 'abeja', name: 'Abeja' },
  'abeja/meta': { slug: 'abeja-meta', name: 'Abeja Meta' },
  'abeja/ux': { slug: 'abeja-ux', name: 'Abeja UX' },
  'sandbox/ideas': { slug: 'sandbox', name: 'Sandbox' },
  'govtech/mipqrsd': { slug: 'mipqrsd', name: 'MiPQRSD' },
  'diseno/ux': { slug: 'diseno-ux', name: 'Diseño UX' },
}

async function main() {
  console.log('=== v3 Migration: Flatten to Space → Task ===\n')

  // 1. Read current spaces with domain info
  const spaces = await prisma.$queryRawUnsafe(
    'SELECT s.id, s.slug, s.name, s."domainId", d.slug as domain_slug FROM "Space" s JOIN "Domain" d ON s."domainId" = d.id ORDER BY d."sortOrder", s.name'
  )
  console.log(`Found ${spaces.length} spaces\n`)

  // 2. Alter Space table: drop composite unique, add columns
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_domainId_slug_key"')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" ALTER COLUMN "domainId" DROP NOT NULL')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" ADD COLUMN IF NOT EXISTS color TEXT DEFAULT \'#8b9ab0\'')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0')
  console.log('Space table altered.\n')

  // 3. Rename slugs and set colors
  let order = 0
  for (const space of spaces) {
    const key = `${space.domain_slug}/${space.slug}`
    const mapping = SLUG_MAP[key]
    const color = DOMAIN_COLORS[space.domain_slug] || '#8b9ab0'

    if (mapping) {
      await prisma.$executeRawUnsafe(
        'UPDATE "Space" SET slug = $1, name = $2, color = $3, "sortOrder" = $4 WHERE id = $5',
        mapping.slug, mapping.name, color, order++, space.id
      )
      console.log(`  ${key} → ${mapping.slug} (${mapping.name})`)
    } else {
      const newSlug = `${space.domain_slug}-${space.slug}`
      await prisma.$executeRawUnsafe(
        'UPDATE "Space" SET slug = $1, color = $2, "sortOrder" = $3 WHERE id = $4',
        newSlug, color, order++, space.id
      )
      console.log(`  ${key} → ${newSlug} (fallback)`)
    }
  }

  // 4. Add unique constraint on slug
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" ADD CONSTRAINT "Space_slug_key" UNIQUE (slug)')
  console.log('\nSlug unique constraint added.')

  // 5. Rename Capture → Task
  console.log('\nRenaming Capture → Task...')
  await prisma.$executeRawUnsafe('ALTER TABLE "Capture" RENAME TO "Task"')
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "Capture_id_seq" RENAME TO "Task_id_seq"')
  await prisma.$executeRawUnsafe('ALTER INDEX "Capture_pkey" RENAME TO "Task_pkey"')
  await prisma.$executeRawUnsafe('ALTER INDEX "Capture_capRef_key" RENAME TO "Task_capRef_key"')

  // 6. Set all status to open where null
  await prisma.$executeRawUnsafe("UPDATE \"Task\" SET status = 'open' WHERE status IS NULL")
  const counts = await prisma.$queryRawUnsafe('SELECT status, COUNT(*)::int as count FROM "Task" GROUP BY status')
  console.log('Task statuses:', counts)

  // 7. Update Comment: rename captureId → taskId, add attachments
  console.log('\nUpdating Comment table...')
  await prisma.$executeRawUnsafe('ALTER TABLE "Comment" RENAME COLUMN "captureId" TO "taskId"')
  await prisma.$executeRawUnsafe('ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS attachments JSONB')
  // Rename the foreign key constraint
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Comment" RENAME CONSTRAINT "Comment_captureId_fkey" TO "Comment_taskId_fkey"')
  } catch (e) {
    console.log('  FK rename skipped (may already be renamed)')
  }

  // Update FK reference from Capture to Task
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_taskId_fkey"')
    await prisma.$executeRawUnsafe('ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE RESTRICT ON UPDATE CASCADE')
  } catch (e) {
    console.log('  FK update note:', e.message)
  }

  // 8. Create Contact table
  console.log('Creating Contact table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Contact" (
      id SERIAL PRIMARY KEY,
      "spaceId" INTEGER NOT NULL REFERENCES "Space"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      notes TEXT,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 9. Drop old tables
  console.log('Dropping old tables...')
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Event" CASCADE')
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "CaptureConnection" CASCADE')

  // 10. Drop old columns from Task
  console.log('Cleaning Task columns...')
  const dropCols = ['type', 'confidence', 'frequency', 'rooting', 'scope', 'manualOrder', 'assignedTo', 'attachments', 'metadata', 'sourceUrl', 'parentId']
  for (const col of dropCols) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Task" DROP COLUMN IF EXISTS "${col}"`)
    } catch (e) { /* ignore */ }
  }

  // 11. Drop Domain
  console.log('Dropping Domain...')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_domainId_fkey"')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP COLUMN IF EXISTS "domainId"')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP COLUMN IF EXISTS mode')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP COLUMN IF EXISTS "coverImage"')
  await prisma.$executeRawUnsafe('ALTER TABLE "Space" DROP COLUMN IF EXISTS phase')
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Domain" CASCADE')

  // 12. Reset sequences
  await prisma.$executeRawUnsafe('SELECT setval(\'"Task_id_seq"\', (SELECT COALESCE(MAX(id),1) FROM "Task"))')
  await prisma.$executeRawUnsafe('SELECT setval(\'"Space_id_seq"\', (SELECT COALESCE(MAX(id),1) FROM "Space"))')

  // 13. Verify
  console.log('\n=== Verification ===')
  const finalSpaces = await prisma.$queryRawUnsafe('SELECT slug, name, color FROM "Space" ORDER BY "sortOrder"')
  console.log(`\nSpaces (${finalSpaces.length}):`)
  for (const s of finalSpaces) console.log(`  ${s.slug} — ${s.name} [${s.color}]`)

  const taskCounts = await prisma.$queryRawUnsafe('SELECT status, COUNT(*)::int as count FROM "Task" GROUP BY status')
  console.log('\nTasks:', taskCounts)

  const tables = await prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
  console.log('\nTables:', tables.map(t => t.tablename))

  console.log('\n✅ v3 migration complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
