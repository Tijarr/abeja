const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DOMAIN_MAP = {
  finca:    { name: 'Finca',    color: '#6bc9a0', sortOrder: 0, spaces: ['pajarillo', 'finca-legal'] },
  media:    { name: 'Media',    color: '#d4636c', sortOrder: 1, spaces: ['vecino-editorial', 'vecino-producto', 'republica-malandra', 'canticuento', 'canticuento-producto'] },
  govtech:  { name: 'Govtech',  color: '#6bc9a0', sortOrder: 2, spaces: ['mipqrsd'] },
  personal: { name: 'Personal', color: '#e07eb4', sortOrder: 3, spaces: ['personal', 'maximas', 'blog', 'familia-hijos', 'familia-hogar'] },
  abeja:    { name: 'Abeja',    color: '#e8ab5e', sortOrder: 4, spaces: ['abeja', 'abeja-meta', 'abeja-ux', 'sandbox', 'diseno-ux'] },
}

async function main() {
  console.log('=== Abeja v4 Migration: Restore Domains ===\n')

  // 1. Create or update Domain table
  console.log('1. Creating/updating Domain table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Domain" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#8b9ab0',
      "sortOrder" INT NOT NULL DEFAULT 0
    )
  `)
  // Add missing columns if Domain table already existed (from v1)
  const domainCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Domain'
  `)
  const domainColNames = domainCols.map(c => c.column_name)
  if (!domainColNames.includes('color')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Domain" ADD COLUMN color TEXT NOT NULL DEFAULT '#8b9ab0'`)
  }
  if (!domainColNames.includes('sortOrder')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Domain" ADD COLUMN "sortOrder" INT NOT NULL DEFAULT 0`)
  }

  // 2. Insert domains
  console.log('2. Inserting domains...')
  const domainIds = {}
  for (const [slug, config] of Object.entries(DOMAIN_MAP)) {
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO "Domain" (name, slug, color, "sortOrder")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = $1
       RETURNING id`,
      config.name, slug, config.color, config.sortOrder
    )
    domainIds[slug] = rows[0].id
    console.log(`   Domain: ${config.name} (id=${rows[0].id})`)
  }

  // 3. Add domainId column to Space
  console.log('3. Adding domainId to Space...')
  const colExists = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Space' AND column_name = 'domainId'
  `)
  if (colExists.length === 0) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Space" ADD COLUMN "domainId" INT`)
  }

  // 4. Map spaces to domains
  console.log('4. Mapping spaces to domains...')
  for (const [domainSlug, config] of Object.entries(DOMAIN_MAP)) {
    const did = domainIds[domainSlug]
    for (const spaceSlug of config.spaces) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Space" SET "domainId" = $1 WHERE slug = $2`,
        did, spaceSlug
      )
      console.log(`   ${spaceSlug} → ${config.name}`)
    }
  }

  // Catch any unmapped spaces
  const unmapped = await prisma.$queryRawUnsafe(
    `SELECT slug FROM "Space" WHERE "domainId" IS NULL`
  )
  if (unmapped.length > 0) {
    console.log(`   Unmapped spaces found, assigning to Abeja domain:`)
    for (const s of unmapped) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Space" SET "domainId" = $1 WHERE slug = $2`,
        domainIds['abeja'], s.slug
      )
      console.log(`   ${s.slug} → Abeja`)
    }
  }

  // 5. Make domainId NOT NULL + FK
  console.log('5. Adding NOT NULL constraint and FK...')
  await prisma.$executeRawUnsafe(`ALTER TABLE "Space" ALTER COLUMN "domainId" SET NOT NULL`)

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Space_domainId_fkey') THEN
        ALTER TABLE "Space" ADD CONSTRAINT "Space_domainId_fkey"
        FOREIGN KEY ("domainId") REFERENCES "Domain"(id);
      END IF;
    END $$
  `)

  // 6. Drop old Space unique constraint on slug alone, add composite
  console.log('6. Updating Space unique constraints...')
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_slug_key";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$
  `)
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Space_domainId_slug_key" ON "Space" ("domainId", slug)
  `)

  // 7. Add type and assignee columns to Task
  console.log('7. Adding type and assignee to Task...')
  const taskCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Task'
  `)
  const taskColNames = taskCols.map(c => c.column_name)

  if (!taskColNames.includes('type')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN type TEXT NOT NULL DEFAULT 'normal'`)
    console.log('   Added type column')
  }
  if (!taskColNames.includes('assignee')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN assignee TEXT`)
    console.log('   Added assignee column')
  }

  // 8. Drop attachments from Comment (migrating to Document model)
  console.log('8. Removing attachments from Comment...')
  if (taskColNames.includes('attachments') || true) {
    const commentCols = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'Comment'
    `)
    if (commentCols.some(c => c.column_name === 'attachments')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Comment" DROP COLUMN IF EXISTS attachments`)
      console.log('   Dropped Comment.attachments')
    }
  }

  // 9. Create TaskType table
  console.log('9. Creating TaskType table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TaskType" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      instructions TEXT,
      tools JSONB,
      structure JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // 10. Create Document table
  console.log('10. Creating Document table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Document" (
      id SERIAL PRIMARY KEY,
      "spaceId" INT NOT NULL REFERENCES "Space"(id),
      name TEXT NOT NULL,
      url TEXT,
      "storagePath" TEXT,
      "mimeType" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // 11. Create TaskDocument join table
  console.log('11. Creating TaskDocument table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TaskDocument" (
      "taskId" INT NOT NULL REFERENCES "Task"(id),
      "documentId" INT NOT NULL REFERENCES "Document"(id),
      PRIMARY KEY ("taskId", "documentId")
    )
  `)

  // 12. Remove the old Capture_spaceId_fkey and rename if needed
  console.log('12. Cleaning up old FK names...')
  const oldFk = await prisma.$queryRawUnsafe(`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'Task' AND constraint_name = 'Capture_spaceId_fkey'
  `)
  if (oldFk.length > 0) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" DROP CONSTRAINT "Capture_spaceId_fkey"`)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Task" ADD CONSTRAINT "Task_spaceId_fkey"
      FOREIGN KEY ("spaceId") REFERENCES "Space"(id)
    `)
    console.log('   Renamed Capture_spaceId_fkey → Task_spaceId_fkey')
  }

  console.log('\n=== Migration complete! ===')
  console.log('Run: npx prisma db pull && npx prisma generate')
}

main()
  .catch(e => { console.error('Migration failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
