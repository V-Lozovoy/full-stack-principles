import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, api } from '../api/client'
import type { Note, Page } from '../types'

/**
 * Серверні дані — це кеш, а не стан застосунку. Список належить серверу,
 * у клієнта лише копія, і вона застаріває. Тримати її в useState або
 * в сторі — робити руками те, що бібліотека кеша робить сама.
 */

// queryKey — адреса даних у кеші. Обовʼязково МАСИВ, а не рядок:
// це найчастіша помилка на Пз6.
const notesKey = ['notes'] as const

export function useNotes() {
  return useQuery({
    queryKey: notesKey,
    queryFn: () => api<Page<Note>>('/notes'),
  })
}

export function useNote(id: number) {
  return useQuery({
    queryKey: ['notes', id],
    // Некоректний id в адресі (/notes/abc) не вимикаємо через enabled:
    // вимкнений запит назавжди лишається у стані pending, і сторінка
    // висить на «Завантаження…» замість того, щоб показати помилку.
    queryFn: () => {
      if (!Number.isFinite(id)) throw new ApiError(404, 'Запис не знайдено')
      return api<Note>(`/notes/${id}`)
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Note>) =>
      api<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    // Після мутації кеш не правимо руками: позначаємо ключ застарілим,
    // і Query перечитує список сам. Один рядок замість load() всюди.
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Note> }) =>
      api<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api<void>(`/notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey }),
  })
}
