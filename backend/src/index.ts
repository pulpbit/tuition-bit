import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

type Bindings = {
  DB: any

  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://tuition-bit.pages.dev'], // Frontend URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Clerk Middleware
app.use('*', clerkMiddleware())

app.get('/', (c) => {
  return c.text('Tuition Bit API is running!')
})

// Protected routes group
const api = app.basePath('/api')

api.use('*', async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})

api.get('/students', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM students WHERE tutor_id = ? ORDER BY created_at DESC'
  ).bind(tutorId).all()

  return c.json(results)
})

api.post('/students', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  const body = await c.req.json()
  const id = (globalThis as any).crypto.randomUUID()
  
  await c.env.DB.prepare(
    `INSERT INTO students (id, tutor_id, name, class_name, school, board, parent_name, parent_phone, whatsapp, monthly_fee, joining_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, tutorId, body.name, body.class_name, body.school, body.board,
    body.parent_name, body.parent_phone, body.whatsapp, body.monthly_fee, body.joining_date
  ).run()

  return c.json({ id, message: 'Student created successfully' })
})

api.put('/students/:id', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  const id = c.req.param('id')
  const body = await c.req.json()

  await c.env.DB.prepare(
    `UPDATE students SET name = ?, class_name = ?, school = ?, board = ?, parent_name = ?, parent_phone = ?, whatsapp = ?, monthly_fee = ?, joining_date = ?
     WHERE id = ? AND tutor_id = ?`
  ).bind(
    body.name, body.class_name, body.school, body.board, body.parent_name, body.parent_phone, body.whatsapp, body.monthly_fee, body.joining_date, id, tutorId
  ).run()

  return c.json({ message: 'Student updated successfully' })
})

api.delete('/students/:id', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  const id = c.req.param('id')

  await c.env.DB.prepare('DELETE FROM students WHERE id = ? AND tutor_id = ?').bind(id, tutorId).run()

  return c.json({ message: 'Student deleted successfully' })
})

api.get('/students/:id', async (c) => {
  const auth = getAuth(c)
  const id = c.req.param('id')
  const tutorId = auth!.orgId || auth!.userId

  const student = await c.env.DB.prepare('SELECT * FROM students WHERE id = ? AND tutor_id = ?').bind(id, tutorId).first()
  if (!student) return c.json({ error: 'Not found' }, 404)
  return c.json(student)
})

api.get('/students/:id/fees', async (c) => {
  const auth = getAuth(c)
  const studentId = c.req.param('id')
  
  // Get all payments for this student
  const payments = await c.env.DB.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC').bind(studentId).all()
  
  return c.json({
    payments: payments.results
  })
})

api.post('/students/:id/payments', async (c) => {
  const auth = getAuth(c)
  const studentId = c.req.param('id')
  const body = await c.req.json()
  const paymentId = (globalThis as any).crypto.randomUUID()
  const today = new Date().toISOString()
  
  await c.env.DB.prepare(
    'INSERT INTO payments (id, student_id, amount, payment_date, billing_period, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(paymentId, studentId, body.amount, today, body.billing_period, body.notes || '').run()
  
  return c.json({ message: 'Payment recorded successfully' })
})

api.get('/fees', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  
  const students = await c.env.DB.prepare('SELECT * FROM students WHERE tutor_id = ?').bind(tutorId).all()
  const paymentsQuery = await c.env.DB.prepare('SELECT student_id, sum(amount) as total_paid FROM payments GROUP BY student_id').all()
  
  const paymentsMap = new Map(paymentsQuery.results.map((p: any) => [p.student_id, p.total_paid || 0]))
  
  const now = new Date()
  
  const results = students.results.map((student: any) => {
      const joinDate = new Date(student.joining_date)
      let monthsPassed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth()) + 1
      if (monthsPassed < 1) monthsPassed = 1
      
      const monthlyFee = Number(student.monthly_fee)
      const expectedTotal = monthsPassed * monthlyFee
      const totalPaid = Number(paymentsMap.get(student.id) || 0)
      
      let pendingMonths = 0
      let paidMonths = totalPaid / monthlyFee
      let overpaidAmount = 0
      
      if (totalPaid >= expectedTotal) {
          overpaidAmount = totalPaid - expectedTotal
      } else {
          pendingMonths = Math.ceil((expectedTotal - totalPaid) / monthlyFee)
      }
      
      return {
          student_id: student.id,
          name: student.name,
          class_name: student.class_name,
          monthly_fee: student.monthly_fee,
          months_passed: monthsPassed,
          total_paid: totalPaid,
          paid_months: paidMonths,
          pending_months: pendingMonths,
          status: pendingMonths > 0 ? (pendingMonths > 1 ? 'OVERDUE' : 'PENDING') : 'PAID'
      }
  })
  
  return c.json(results)
})

api.get('/attendance', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]

  // Get all students for tutor
  const students = await c.env.DB.prepare('SELECT id, name, class_name FROM students WHERE tutor_id = ? ORDER BY name ASC').bind(tutorId).all()
  
  // Get attendance records for date
  const records = await c.env.DB.prepare(
    'SELECT a.* FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.tutor_id = ? AND a.date = ?'
  ).bind(tutorId, date).all()

  const attendanceMap = new Map(records.results.map((r: any) => [r.student_id, r.status]))

  const result = students.results.map((s: any) => ({
    student_id: s.id,
    name: s.name,
    class_name: s.class_name,
    status: attendanceMap.get(s.id) || null // null means not marked yet
  }))

  return c.json(result)
})

api.post('/attendance', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId
  const body = await c.req.json()
  const { date, records } = body // records: { student_id, status }[]
  
  // Delete existing records for this date
  for (const record of records) {
      await c.env.DB.prepare('DELETE FROM attendance WHERE student_id = ? AND date = ?').bind(record.student_id, date).run()
      
      if (record.status) {
          const id = (globalThis as any).crypto.randomUUID()
          await c.env.DB.prepare(
            'INSERT INTO attendance (id, student_id, date, status) VALUES (?, ?, ?, ?)'
          ).bind(id, record.student_id, date, record.status).run()
      }
  }

  return c.json({ message: 'Attendance updated successfully' })
})

api.get('/metrics', async (c) => {
  const auth = getAuth(c)
  const tutorId = auth!.orgId || auth!.userId

  const studentsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM students WHERE tutor_id = ?').bind(tutorId).first('count')

  const students = await c.env.DB.prepare('SELECT * FROM students WHERE tutor_id = ?').bind(tutorId).all()
  const paymentsQuery = await c.env.DB.prepare('SELECT student_id, sum(amount) as total_paid FROM payments GROUP BY student_id').all()
  const paymentsMap = new Map(paymentsQuery.results.map((p: any) => [p.student_id, Number(p.total_paid || 0)]))
  
  const now = new Date()
  let totalFeeCollectedThisMonth = 0
  let overdueCount = 0
  let totalDue = 0

  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthPayments = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM payments WHERE billing_period LIKE ?"
  ).bind(`%${thisMonthStart}%`).first('total')
  totalFeeCollectedThisMonth = Number(thisMonthPayments || 0)

  for (const student of students.results as any[]) {
    const joinDate = new Date(student.joining_date)
    let monthsPassed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth()) + 1
    if (monthsPassed < 1) monthsPassed = 1
    const monthlyFee = Number(student.monthly_fee)
    const expectedTotal = monthsPassed * monthlyFee
    const rawPaid = paymentsMap.get(student.id)
    const totalPaid: number = typeof rawPaid === 'number' ? rawPaid : 0
    if (totalPaid < expectedTotal) {
      const pendingMonths = Math.ceil((expectedTotal - totalPaid) / monthlyFee)
      totalDue += pendingMonths * monthlyFee
      if (pendingMonths > 1) overdueCount++
    }
  }

  return c.json({
    totalStudents: studentsCount,
    activeStudents: studentsCount,
    feeCollected: totalFeeCollectedThisMonth,
    feeDue: totalDue,
    overdue: overdueCount
  })
})

export default app
