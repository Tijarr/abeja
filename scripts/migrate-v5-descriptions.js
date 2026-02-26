const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== v5 Migration: Add description + SlugRedirect ===\n')

  // 1. Add description to Domain
  console.log('1. Adding description to Domain...')
  const domainCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Domain'
  `)
  if (!domainCols.some(c => c.column_name === 'description')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Domain" ADD COLUMN description TEXT`)
    console.log('   Added Domain.description')
  } else {
    console.log('   Already exists')
  }

  // 2. Add description to Space
  console.log('2. Adding description to Space...')
  const spaceCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Space'
  `)
  if (!spaceCols.some(c => c.column_name === 'description')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Space" ADD COLUMN description TEXT`)
    console.log('   Added Space.description')
  } else {
    console.log('   Already exists')
  }

  // 3. Create SlugRedirect table
  console.log('3. Creating SlugRedirect table...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SlugRedirect" (
      id SERIAL PRIMARY KEY,
      "oldSlug" TEXT NOT NULL,
      "newSlug" TEXT NOT NULL,
      type TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "SlugRedirect_oldSlug_type_idx" ON "SlugRedirect" ("oldSlug", type)
  `)
  console.log('   Created SlugRedirect table + index')

  console.log('\n=== Migration complete! ===')
}

main()
  .catch(e => { console.error('Migration failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
