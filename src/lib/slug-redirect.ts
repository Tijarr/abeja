import { prisma } from './prisma'

/**
 * Resolve a slug through the redirect chain.
 * Returns the final slug if redirects exist, or null if no redirect found.
 */
export async function resolveSlug(slug: string, type: 'domain' | 'space'): Promise<string | null> {
  const maxDepth = 5
  let current = slug
  for (let i = 0; i < maxDepth; i++) {
    const redirect = await prisma.slugRedirect.findFirst({
      where: { oldSlug: current, type },
      orderBy: { createdAt: 'desc' },
    })
    if (!redirect) break
    current = redirect.newSlug
    if (i === 0 && current !== slug) continue
  }
  return current !== slug ? current : null
}
