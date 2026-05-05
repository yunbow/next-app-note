import { PrismaClient } from '@prisma/client'
import { seedDev } from './seeds/dev'
import { seedProd } from './seeds/prod'

const prisma = new PrismaClient()

async function main() {
  const rawMode = process.env.SEED_MODE
  const mode = rawMode ?? (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')

  if (mode !== 'dev' && mode !== 'prod') {
    throw new Error(`Invalid SEED_MODE: "${mode}". Allowed values: "dev" | "prod"`)
  }

  if (mode === 'dev' && process.env.NODE_ENV === 'production') {
    throw new Error('Running dev seed in NODE_ENV=production is not allowed')
  }

  console.log(`[seed] mode=${mode}`)

  if (mode === 'dev') {
    await seedDev(prisma)
  } else {
    await seedProd(prisma)
  }

  console.log('[seed] done')
}

main()
  .catch((e) => {
    console.error('[seed] error', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
