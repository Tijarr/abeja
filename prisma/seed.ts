import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const SEED_DIR = path.join(__dirname, '..', 'seed-data')

const TYPE_MAPPING: Record<string, string> = {
  'task': 'tarea',
  'tarea': 'tarea',
  'idea': 'idea',
  'concept': 'idea',
  'assertion': 'fact',
  'creencia': 'fact',
  'reflection': 'fact',
  'reflexion': 'fact',
  'routine': 'fact',
  'regla': 'fact',
  'reference': 'referencia',
  'referencia': 'referencia',
  'fact': 'fact',
}

interface ParsedCapture {
  capRef: string
  date: string
  type: string
  body: string
  title?: string
  tags?: string[]
  sourceUrl?: string
  status?: string
  confidence?: string
  deadline?: string
  frequency?: string
}

function parseMdFile(filePath: string): ParsedCapture[] {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const entries = fileContent.split(/^### /m).slice(1)
  const captures: ParsedCapture[] = []

  for (const entry of entries) {
    const lines = entry.trim().split('\n')
    const header = lines[0] || ''
    const dateMatch = header.match(/\[(\d{4}-\d{2}-\d{2}\s[\d:]+)\]\s*(cap-\d+)/)

    const cap: Partial<ParsedCapture> & { capRef: string; date: string; type: string } = {
      capRef: dateMatch?.[2] || '',
      date: dateMatch?.[1] || '2025-01-01 00:00',
      type: 'idea',
    }

    for (const line of lines.slice(1)) {
      const m = line.match(/^\s*-\s*\*\*(\w+)\*\*:\s*(.+)/)
      if (m) {
        const key = m[1].toLowerCase()
        const val = m[2].trim()
        if (key === 'type') cap.type = TYPE_MAPPING[val] || val
        else if (key === 'content' || key === 'body') cap.body = val
        else if (key === 'title') cap.title = val
        else if (key === 'status') cap.status = val
        else if (key === 'confidence') cap.confidence = val
        else if (key === 'deadline') cap.deadline = val
        else if (key === 'frequency') cap.frequency = val
      }
    }

    if (cap.body && cap.capRef) {
      if (!cap.title) cap.title = cap.body.substring(0, 200)
      captures.push(cap as ParsedCapture)
    }
  }

  return captures
}

async function main() {
  console.log('🐝 Seeding Abeja...')

  // Clean
  await prisma.event.deleteMany()
  await prisma.captureConnection.deleteMany()
  await prisma.capture.deleteMany()
  await prisma.space.deleteMany()
  await prisma.domain.deleteMany()

  const domainsConfig = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'domains.json'), 'utf8'))

  let order = 0
  for (const [slug, config] of Object.entries(domainsConfig) as [string, any][]) {
    const domain = await prisma.domain.create({
      data: { name: config.name, slug, vault: config.vault || false, sortOrder: order++ }
    })

    for (const spaceName of config.spaces) {
      await prisma.space.create({
        data: { domainId: domain.id, name: spaceName, slug: spaceName, mode: 'creation' }
      })
    }
  }

  // Parse captures from seed-data/{domain}/{space}/*.md
  for (const [domainSlug] of Object.entries(domainsConfig)) {
    const domainDir = path.join(SEED_DIR, domainSlug)
    if (!fs.existsSync(domainDir)) continue

    const domain = await prisma.domain.findUnique({ where: { slug: domainSlug } })
    if (!domain) continue

    for (const spaceSlug of fs.readdirSync(domainDir)) {
      const spaceDir = path.join(domainDir, spaceSlug)
      if (!fs.existsSync(spaceDir) || !fs.statSync(spaceDir).isDirectory()) continue

      const space = await prisma.space.findFirst({
        where: { domainId: domain.id, slug: spaceSlug }
      })
      if (!space) continue

      for (const file of fs.readdirSync(spaceDir)) {
        if (!file.endsWith('.md')) continue
        const captures = parseMdFile(path.join(spaceDir, file))

        for (const cap of captures) {
          try {
            await prisma.capture.upsert({
              where: { capRef: cap.capRef },
              create: {
                spaceId: space.id,
                type: cap.type,
                title: cap.title || cap.body.substring(0, 200),
                body: cap.body,
                tags: cap.tags || [],
                capRef: cap.capRef,
                status: cap.status || null,
                confidence: cap.confidence || null,
                deadline: cap.deadline ? new Date(cap.deadline) : null,
                frequency: cap.frequency || null,
                source: 'seed',
                createdAt: new Date(cap.date),
              },
              update: {
                title: cap.title || cap.body.substring(0, 200),
                body: cap.body,
                type: cap.type,
                status: cap.status || null,
              }
            })
          } catch (e) {
            console.log(`  Skip ${cap.capRef}: ${e}`)
          }
        }
      }
    }
  }

  const count = await prisma.capture.count()
  console.log(`✅ Seeded ${count} captures`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
