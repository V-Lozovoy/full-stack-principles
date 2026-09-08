import request from 'supertest'
import { after, it } from 'node:test'
import assert from 'node:assert/strict'

import { buildApp } from '../../../Пз2/server/src/app.js'

// Один застосунок на весь файл: фабрика buildApp() не займає порт, тому
// supertest сам піднімає його на вільному порту — сервер запускати не треба.
const app = buildApp()
await app.ready()

after(() => app.close())

const api = request(app.server)

const goodBody = {
  title: 'Кавʼярня на Яворницького',
  lat: 48.4647,
  lng: 35.0462,
  tags: ['кава'],
}

// Тіло, яке схема мусить відхилити: порожня назва і широта 999.
const badBody = { title: '', lat: 999, lng: 35.0462 }

// id запису з перевірки 3: ним користуються перевірки 6 і 8.
let createdId: number | undefined

it('1. GET /api/health → 200', async () => {
  const res = await api.get('/api/health').expect(200)
  assert.equal(res.body.status, 'ok')
})

it('2. GET /api/notes → 200 і обгортка списку', async () => {
  const res = await api.get('/api/notes').expect(200)
  assert.ok(Array.isArray(res.body.items), 'items має бути масивом')
  assert.equal(typeof res.body.total, 'number')
})

it('3. POST /api/notes → 201 і id у тілі', async () => {
  const res = await api.post('/api/notes').send(goodBody).expect(201)
  assert.equal(typeof res.body.id, 'number', 'у тілі має бути числовий id')
  createdId = res.body.id
})

it('4. POST з невалідним тілом → 400', async () => {
  await api.post('/api/notes').send(badBody).expect(400)
})

it('5. у 400 є details із полем title', async () => {
  const res = await api.post('/api/notes').send(badBody).expect(400)
  const fields = (res.body.details ?? []).map((d: { field: unknown }) => d.field)
  assert.ok(
    fields.includes('title'),
    `очікував «title» серед полів details, отримав ${JSON.stringify(fields)}`,
  )
})

it('6. PATCH /api/notes/:id → 200', async () => {
  assert.ok(createdId, 'немає id — спершу має пройти створення (перевірка 3)')
  const res = await api.patch(`/api/notes/${createdId}`).send({ visited: true }).expect(200)
  assert.equal(res.body.visited, true)
})

it('7. GET /api/notes/999999 → 404', async () => {
  await api.get('/api/notes/999999').expect(404)
})

it('8. DELETE /api/notes/:id → 204, потім GET → 404', async () => {
  assert.ok(createdId, 'немає id — спершу має пройти створення (перевірка 3)')
  await api.delete(`/api/notes/${createdId}`).expect(204)
  await api.get(`/api/notes/${createdId}`).expect(404)
})
