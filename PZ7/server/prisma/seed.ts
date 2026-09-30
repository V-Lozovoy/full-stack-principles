// Наповнення бази демо-даними: npx prisma db seed
//
// Навіщо: порожня база і зламаний запит на екрані виглядають однаково.
// Коли в базі є десяток записів, одразу видно, що працює, а що ні —
// і на Пз6 буде що показати у списку, і на захисті не доведеться
// створювати дані руками під час демонстрації.
//
// Seed наповнює базу розробки і CI. У прод такі дані не їдуть ніколи.
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_NOTES = [
  { title: 'Кавʼярня на Яворницького', lat: 48.4647, lng: 35.0462, tags: ['кава', 'wifi'] },
  { title: 'Набережна біля мосту', lat: 48.4501, lng: 35.0289, tags: ['прогулянка'] },
  { title: 'Книгарня в центрі', lat: 48.4664, lng: 35.0459, tags: ['книги', 'wifi'] },
  { title: 'Парк Шевченка', lat: 48.4489, lng: 35.0553, tags: ['прогулянка'] },
]

async function main() {
  // Пароль у seed — теж лише хеш. Демонстраційний, але правило одне.
  const password = await bcrypt.hash('demo1234', 10)

  // upsert, а не create: seed можна запускати скільки завгодно разів
  // і він не впаде на унікальному email.
  const author = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', password },
  })

  // Адміністратора призначаємо тут, а не через API: ендпоінта
  // «зроби мене адміном» не існує і існувати не повинно.
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'admin' },
    create: { email: 'admin@example.com', password, role: 'admin' },
  })

  for (const note of DEMO_NOTES) {
    const exists = await prisma.note.findFirst({
      where: { title: note.title, authorId: author.id },
    })
    if (exists) continue

    await prisma.note.create({
      data: {
        title: note.title,
        lat: note.lat,
        lng: note.lng,
        authorId: author.id,
        // connectOrCreate: тег «кава» створиться один раз, далі підключиться
        tags: {
          connectOrCreate: note.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })
  }

  const total = await prisma.note.count()
  console.log(`Seed завершено. Нотаток у базі: ${total}`)
  console.log('Користувачі: demo@example.com / admin@example.com, пароль demo1234')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
