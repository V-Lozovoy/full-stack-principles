import { z } from 'zod'

/**
 * Схема — єдине джерело правди про те, які дані вважаються допустимими.
 * З неї ж безкоштовно виводиться TypeScript-тип (z.infer), тому описувати
 * форму даних двічі не треба.
 */
export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Назва обовʼязкова').max(100, 'Максимум 100 символів'),
  text: z.string().trim().max(2000).nullable().default(null),
  lat: z.number('Широта має бути числом').min(-90, 'Широта від -90 до 90').max(90, 'Широта від -90 до 90'),
  lng: z.number('Довгота має бути числом').min(-180, 'Довгота від -180 до 180').max(180, 'Довгота від -180 до 180'),
  tags: z.array(z.string().trim().min(1)).max(10, 'Не більше 10 тегів').default([]),
})

/** PATCH міняє частину полів, тому та сама схема, але всі поля необовʼязкові. */
export const updateNoteSchema = createNoteSchema
  .partial()
  .extend({ visited: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Тіло запиту порожнє: нічого змінювати',
  })

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

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
