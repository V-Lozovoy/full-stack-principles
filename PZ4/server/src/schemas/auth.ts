import { z } from 'zod'

/**
 * Одна схема на реєстрацію і на вхід: вимоги до пароля мають бути однакові
 * в обох місцях, інакше можна зареєструвати пароль, яким потім не увійти.
 */
export const credentialsSchema = z.object({
  // Спершу нормалізуємо, потім перевіряємо формат: у zod чеки йдуть по
  // порядку, і z.email().trim() відхилив би ' user@test.com ' замість
  // того, щоб обрізати пробіли.
  email: z.string().trim().toLowerCase().pipe(z.email('Некоректна пошта')),
  password: z
    .string()
    .min(8, 'Мінімум 8 символів')
    // bcrypt рахує БАЙТИ, а не символи, і мовчки обрізає все після 72-го.
    // Кирилиця в UTF-8 — два байти на літеру, тому «72 символи» тут брехня:
    // українською ліміт настав би вже на 36-й. Ріжемо із запасом.
    .max(64, 'Максимум 64 символи')
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, {
      message: 'Пароль задовгий: bcrypt приймає щонайбільше 72 байти',
    }),
})

export type Credentials = z.infer<typeof credentialsSchema>

/** Те, що ми кладемо в токен. Нічого таємного: payload читається без секрету. */
export type AuthUser = {
  id: number
  email: string
  role: string
}
