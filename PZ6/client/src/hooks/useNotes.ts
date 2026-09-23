// TODO(3) [Пз6 · Л6, «Кеш TanStack Query» і «hooks/useNotes.ts»]: дані з сервера через TanStack Query.
//
// Головна думка лекції: серверні дані — це КЕШ, а не стан застосунку.
// Список належить серверу, у клієнта лише копія, і вона застаріває.
// Тримати її в useState — робити руками те, що бібліотека робить сама.
//
//   export function useNotes() {
//     return useQuery({
//       queryKey: ['notes'],                    // ← МАСИВ, не рядок!
//       queryFn: () => api<Page<Note>>('/notes'),
//     })
//   }
//
//   export function useCreateNote() {
//     const qc = useQueryClient()
//     return useMutation({
//       mutationFn: (data) => api('/notes', { method: 'POST', ... }),
//       onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
//     })
//   }
//
// Ще потрібні useNote(id), useUpdateNote(), useDeleteNote(). Їх же читає
// і мапа з кроку 4 - один кеш на список і маркери.
//
// Після цього кроку з NotesListPage мають ЗНИКНУТИ useEffect, useState
// і функція load(). Стани приходять готовими: isPending, isError, refetch.
// Навіть pendingId більше не ваш: update.isPending && update.variables?.id.
//
// Після мутації кеш НЕ правимо руками: позначаємо ключ застарілим, і Query
// перечитує список сам. Один рядок замість load() у кожному обробнику.
//
// queryKey рядком замість масиву — найчастіша помилка практичної:
// invalidate тихо не спрацьовує, і список «не оновлюється».
//
// Як видно, що не зроблено: у консолі «No QueryClient set, use QueryClientProvider».

export {}
