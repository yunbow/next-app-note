import { PrismaClient } from '@prisma/client'
import { seedCommon } from './common'

export async function seedProd(prisma: PrismaClient) {
  await seedCommon(prisma)
  console.log('[seed:prod] master data seeded')
}
