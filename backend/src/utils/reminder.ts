export function generateMessage(
  studentName: string,
  monthlyFee: number,
  periodStart: string,
  periodEnd: string,
  orgName: string,
  userName?: string
): string {
  const start = new Date(periodStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const end = new Date(periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return [
    `*Dear Parent,*`,
    ``,
    `This is a friendly reminder that the tuition fee for ${studentName} for the period ${start} to ${end} is still pending.`,
    ``,
    `*Monthly Fee:*`,
    `₹${monthlyFee}`,
    ``,
    `Please make the payment at your convenience.`,
    ``,
    `*Thank you.*`,
    `${userName}`,
    `*TuitionBit App*`,
  ].join('\n')
}

function addMonths(date: Date, n: number): Date {
  const result = new Date(date)
  const targetDay = result.getDate()
  result.setMonth(result.getMonth() + n)
  if (result.getDate() !== targetDay) {
    result.setDate(0)
  }
  return result
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function generateBillingPeriods(joinDate: Date, now: Date) {
  const periods: {
    periodStart: string
    periodEnd: string
    dueDate: string
    billingKey: string
  }[] = []

  let current = new Date(joinDate)

  while (current <= now) {
    const periodStart = new Date(current)
    const nextStart = addMonths(periodStart, 1)
    const periodEnd = new Date(nextStart)
    periodEnd.setDate(periodEnd.getDate() - 1)
    const dueDate = new Date(periodEnd)

    periods.push({
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      dueDate: formatDate(dueDate),
      billingKey: `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
    })

    current = nextStart
  }

  return periods
}

export async function checkAndCreateReminders(env: any) {
  const now = new Date()

  const tutors = await env.DB.prepare(
    'SELECT DISTINCT tutor_id FROM students'
  ).all()

  for (const tutor of tutors.results as any[]) {
    const orgId = tutor.tutor_id

    const students = await env.DB.prepare(
      'SELECT * FROM students WHERE tutor_id = ?'
    ).bind(orgId).all()

    const paidPeriods = await env.DB.prepare(
      'SELECT DISTINCT student_id, billing_period FROM payments'
    ).all()

    const paidSet = new Set(
      (paidPeriods.results as any[]).map(
        (p: any) => `${p.student_id}:${p.billing_period}`
      )
    )

    for (const student of students.results as any[]) {
      const joinDate = new Date(student.joining_date)
      const periods = generateBillingPeriods(joinDate, now)

      for (const period of periods) {
        if (paidSet.has(`${student.id}:${period.billingKey}`)) continue

        const dueDate = new Date(period.dueDate)
        if (now < dueDate) continue

        const oneDayAfterDue = new Date(dueDate)
        oneDayAfterDue.setDate(oneDayAfterDue.getDate() + 1)

        if (now < oneDayAfterDue) continue

        const existingReminders = await env.DB.prepare(
          'SELECT id, reminder_number, created_at, status FROM fee_reminders WHERE student_id = ? AND period_start = ?'
        ).bind(student.id, period.periodStart).all()

        const reminders = (existingReminders.results || []) as any[]
        const hasR1 = reminders.find((r: any) => r.reminder_number === 1)
        const hasR2 = reminders.find((r: any) => r.reminder_number === 2)

        if (!hasR1) {
          const message = generateMessage(
            student.name,
            student.monthly_fee,
            period.periodStart,
            period.periodEnd,
            'Tuition Bit',
            '',
          )

          const id = (globalThis as any).crypto.randomUUID()
          await env.DB.prepare(
            `INSERT INTO fee_reminders (id, org_id, student_id, period_start, period_end, due_date, reminder_number, status, message, student_name, whatsapp, monthly_fee)
             VALUES (?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?, ?, ?)`
          ).bind(
            id,
            orgId,
            student.id,
            period.periodStart,
            period.periodEnd,
            period.dueDate,
            message,
            student.name,
            student.whatsapp || '',
            student.monthly_fee,
          ).run()
        }

        if (hasR1 && !hasR2 && hasR1.status === 'pending') {
          const r1Created = new Date(hasR1.created_at)
          const twoDaysAfterR1 = new Date(r1Created)
          twoDaysAfterR1.setDate(twoDaysAfterR1.getDate() + 2)

          if (now >= twoDaysAfterR1 && paidSet.has(`${student.id}:${period.billingKey}`) === false) {
            const message = generateMessage(
              student.name,
              student.monthly_fee,
              period.periodStart,
              period.periodEnd,
              'Tuition Bit',
              '',
            )

            const id = (globalThis as any).crypto.randomUUID()
            await env.DB.prepare(
              `INSERT INTO fee_reminders (id, org_id, student_id, period_start, period_end, due_date, reminder_number, status, message, student_name, whatsapp, monthly_fee)
               VALUES (?, ?, ?, ?, ?, ?, 2, 'pending', ?, ?, ?, ?)`
            ).bind(
              id,
              orgId,
              student.id,
              period.periodStart,
              period.periodEnd,
              period.dueDate,
              message,
              student.name,
              student.whatsapp || '',
              student.monthly_fee,
            ).run()
          }
        }
      }
    }
  }
}
