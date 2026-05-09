import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedCommon } from './common'

async function upsertUser(
  prisma: PrismaClient,
  email: string,
  username: string,
  name: string,
  password: string,
) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, username, name, password },
  })
}

async function createNoteIfAbsent(
  prisma: PrismaClient,
  authorId: string,
  title: string,
  content: string,
  visibility: string,
  tagNames: string[],
  categoryNames: string[],
) {
  const existing = await prisma.note.findFirst({ where: { authorId, title } })
  if (existing) return existing

  const note = await prisma.note.create({
    data: { title, content, visibility, authorId },
  })

  for (const tagName of tagNames) {
    const tag = await prisma.tag.findUnique({ where: { name: tagName } })
    if (tag) {
      await prisma.noteTag.upsert({
        where: { noteId_tagId: { noteId: note.id, tagId: tag.id } },
        update: {},
        create: { noteId: note.id, tagId: tag.id },
      })
    }
  }

  for (const categoryName of categoryNames) {
    const category = await prisma.category.findUnique({ where: { name: categoryName } })
    if (category) {
      await prisma.noteCategory.upsert({
        where: { noteId_categoryId: { noteId: note.id, categoryId: category.id } },
        update: {},
        create: { noteId: note.id, categoryId: category.id },
      })
    }
  }

  return note
}

export async function seedDev(prisma: PrismaClient) {
  await seedCommon(prisma)

  const hashedPassword = await bcrypt.hash('password123', 10)

  const alice = await upsertUser(prisma, 'alice@example.com', 'alice', 'Alice', hashedPassword)
  const bob = await upsertUser(prisma, 'bob@example.com', 'bob', 'Bob', hashedPassword)

  // Alice's 3 notes
  await createNoteIfAbsent(
    prisma,
    alice.id,
    'Next.js App Router の基礎',
    [
      '# Next.js App Router',
      '',
      'App Router は Next.js 13 で導入された新しいルーティングシステムです。',
      '',
      '## 主な特徴',
      '',
      '- `app/` ディレクトリを使用',
      '- Server Components がデフォルト',
      '- レイアウトのネストが容易',
      '',
      '## ディレクトリ構成例',
      '',
      '```',
      'app/',
      '  layout.tsx',
      '  page.tsx',
      '  (auth)/',
      '    login/page.tsx',
      '```',
    ].join('\n'),
    'public',
    ['TypeScript', 'Next.js'],
    ['技術'],
  )

  await createNoteIfAbsent(
    prisma,
    alice.id,
    'Prisma ORM メモ',
    [
      '# Prisma ORM',
      '',
      'Prisma は TypeScript ファーストの ORM です。',
      '',
      '## よく使うコマンド',
      '',
      '```bash',
      'npx prisma migrate dev',
      'npx prisma studio',
      '```',
      '',
      '## スキーマ定義例',
      '',
      '```prisma',
      'model User {',
      '  id    String @id @default(cuid())',
      '  email String @unique',
      '}',
      '```',
    ].join('\n'),
    'private',
    ['TypeScript', 'Prisma'],
    ['技術'],
  )

  await createNoteIfAbsent(
    prisma,
    alice.id,
    '今日の日記',
    [
      '今日は Next.js のプロジェクトをセットアップしました。',
      '',
      'Prisma との連携もうまくいき、マイグレーションが正常に完了。',
      'SEED データも投入できて動作確認が取れた。',
    ].join('\n'),
    'private',
    ['メモ'],
    ['日記'],
  )

  // Bob's 3 notes
  await createNoteIfAbsent(
    prisma,
    bob.id,
    'React Hooks チートシート',
    [
      '# React Hooks チートシート',
      '',
      '## useState',
      '',
      '```tsx',
      'const [count, setCount] = useState(0)',
      '```',
      '',
      '## useEffect',
      '',
      '```tsx',
      'useEffect(() => {',
      '  fetchData()',
      '}, [dependency])',
      '```',
      '',
      '## useCallback / useMemo',
      '',
      'パフォーマンス最適化に使用。依存配列に注意。',
    ].join('\n'),
    'public',
    ['TypeScript', 'React'],
    ['技術'],
  )

  await createNoteIfAbsent(
    prisma,
    bob.id,
    'アイデアメモ: ダークモード対応',
    [
      '# ダークモード対応のアイデア',
      '',
      '## 実装方針',
      '',
      '- `next-themes` を使う',
      '- CSS variables で色を管理',
      '- システム設定に追従する',
      '',
      '## TODO',
      '',
      '- [ ] テーマ切替ボタンの実装',
      '- [ ] カラーパレットの整理',
    ].join('\n'),
    'private',
    ['メモ', 'TODO'],
    ['アイデア'],
  )

  await createNoteIfAbsent(
    prisma,
    bob.id,
    'TypeScript Tips',
    [
      '# TypeScript Tips',
      '',
      '## satisfies オペレーター',
      '',
      '```ts',
      'const config = {',
      '  port: 3000,',
      '} satisfies Config',
      '```',
      '',
      '型チェックしつつ型推論を維持できる。',
      '',
      '## const アサーション',
      '',
      '```ts',
      "const ROLES = ['admin', 'user'] as const",
      'type Role = typeof ROLES[number]',
      '```',
    ].join('\n'),
    'shared',
    ['TypeScript'],
    ['技術'],
  )

  // Alice: Premium プラン
  await prisma.subscription.upsert({
    where: { userId: alice.id },
    update: { plan: 'premium', status: 'active' },
    create: {
      userId: alice.id,
      plan: 'premium',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
    },
  })

  // Follow relationships: alice <-> bob (互いにフォロー)
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: alice.id, followingId: bob.id } },
    update: {},
    create: { followerId: alice.id, followingId: bob.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: bob.id, followingId: alice.id } },
    update: {},
    create: { followerId: bob.id, followingId: alice.id },
  })

  console.log('[seed:dev] users, notes, follows, and subscriptions seeded')
  console.log('  alice@example.com / password123  (Premium)')
  console.log('  bob@example.com   / password123  (Free)')
}
