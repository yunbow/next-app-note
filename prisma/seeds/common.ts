import { PrismaClient } from '@prisma/client'

const CATEGORIES = ['技術', '日記', 'アイデア', 'プロジェクト']
const TAGS = ['TypeScript', 'Next.js', 'React', 'Prisma', 'メモ', 'TODO']

export async function seedCommon(prisma: PrismaClient) {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  }
  for (const name of TAGS) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log('[seed:common] categories and tags seeded')
}
