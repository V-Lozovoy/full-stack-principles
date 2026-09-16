// TODO(3) [Пз3 · Л3, «seed.ts: база, у якій є що показати»]: наповнення бази демо-даними.
//
// Запуск: npx prisma db seed  (команда вже прописана у prisma.config.ts)
//
// Навіщо це вимога, а не забаганка: порожня база і зламаний запит на екрані
// виглядають однаково. Коли в базі є десяток записів, одразу видно, що
// працює, а що ні — і на Пз6 буде що показати у списку, і на захисті не
// доведеться створювати дані руками під час демонстрації.
//
// Результат: після
//     npx prisma migrate reset
// база піднімається з нуля і в ній одразу є дані. Три команди від git clone
// до працюючого застосунку — це і є критерій.
//
// Каркас:
//
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    // upsert, а не create: seed має переживати повторний запуск
    // і не падати на унікальному полі.
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: { email: 'demo@example.com' },
})

const notes = [
    { title: 'Перший запис', lat: 48.4647, lng: 35.0462 },
    { title: 'Другий запис', lat: 48.4648, lng: 35.0463 },
]

for (const note of notes) {
    const existing = await prisma.note.findFirst({ where: { title: note.title } })
    if (!existing) {
        await prisma.note.create({
            data: { ...note, authorId: demoUser.id },
        })
    }
}}

main()
    .catch((err) => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
//
// Демо-дані комітяться в git. Справжні дані користувачів — ніколи.