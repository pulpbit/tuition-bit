import { Hono } from 'hono'
import { getAuth } from '@hono/clerk-auth'

type Bindings = {
  DB: any
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
}

const reminders = new Hono<{ Bindings: Bindings }>()

reminders.get('/', async (c) => {
  const auth = getAuth(c)
  const orgId = auth!.orgId || auth!.userId

  const reminders = await c.env.DB.prepare(
    `SELECT id, student_name, whatsapp, message, reminder_number, created_at, status
     FROM fee_reminders
     WHERE org_id = ? AND status = 'pending'
     ORDER BY created_at ASC`
  ).bind(orgId).all()

  return c.json(reminders.results)
})

reminders.post('/:id/sent', async (c) => {
  const auth = getAuth(c)
  const orgId = auth!.orgId || auth!.userId
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    `UPDATE fee_reminders
     SET status = 'sent', sent_at = CURRENT_TIMESTAMP
     WHERE id = ? AND org_id = ?`
  ).bind(id, orgId).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  return c.json({ message: 'Reminder marked as sent' })
})

reminders.post('/:id/dismiss', async (c) => {
  const auth = getAuth(c)
  const orgId = auth!.orgId || auth!.userId
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    `UPDATE fee_reminders
     SET status = 'dismissed'
     WHERE id = ? AND org_id = ?`
  ).bind(id, orgId).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  return c.json({ message: 'Reminder dismissed' })
})

export default reminders
