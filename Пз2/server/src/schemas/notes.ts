import { z } from 'zod'

// TODO(1) [Пз2 · Л2, «Валідація: zod-схема як єдине джерело правди»]: дві схеми тіла.
//
//   createNoteSchema — тіло POST. Поля — як у Note (types.ts), крім id,
//   createdAt і visited: їх проставляє store.create(). Один обʼєкт:
//     title  — рядок 1–100 символів, повідомлення «Назва обовʼязкова»
//     text   — необовʼязковий: z.string().max(2000).nullable().default(null)
//     lat    — число від -90 до 90
//     lng    — число від -180 до 180
//     tags   — масив рядків, за замовчуванням порожній
//
//   updateNoteSchema — тіло PATCH. Тут нічого не переписується заново,
//   дві зміни до create-схеми:
//     createNoteSchema.partial()                     — усі поля необовʼязкові
//     .extend({ visited: z.boolean().optional() })   — тест міняє саме visited
//
// Тест перевірки 4 надсилає порожню назву і широту 999 — обидва мають
// відлетіти з 400. А у details (перевірка 5) має зʼявитися поле «title» —
// воно зʼявиться саме собою, якщо в title є .min(1, '...').
//
// Нижче — дві готові схеми для порівняння: так само виглядає валідація
// параметра маршруту і query. Схеми тіла пишуться тим самим зодом.
//
// Як видно, що не зроблено: TODO(2) у routes/notes.ts посилається на схеми,
// яких ще немає — поки їх нема, проєкт навіть не скомпілюється.

/**
 * Параметри маршруту завжди приходять рядками — '42', а не 42.
 * coerce перетворює рядок на число, а 'abc' відхиляє з 400.
 */
export const idParamSchema = z.object({
  id: z.coerce.number('Ідентифікатор має бути числом').int().positive(),
})

/** Query теж валідуємо: це такі самі вхідні дані, як і тіло. */
export const listQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  sort: z.enum(['createdAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListQuery = z.infer<typeof listQuerySchema>
