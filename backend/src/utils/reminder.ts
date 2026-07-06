export function generateMessage(
  studentName: string,
  monthlyFee: number,
  periodStart: string,
  periodEnd: string,
  orgName: string,
): string {
  const start = new Date(periodStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const end = new Date(periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return [
    `Dear Parent,`,
    ``,
    `This is a friendly reminder that the tuition fee for ${studentName} for the period ${start} to ${end} is still pending.`,
    ``,
    `Monthly Fee:`,
    `₹${monthlyFee}`,
    ``,
    `Please make the payment at your convenience.`,
    ``,
    `Thank you.`,
    `${orgName}`,
  ].join('\n')
}

export function getDueDay(joinDate: Date): number {
  return Math.max(1, joinDate.getDate() - 1)
}

export function generateBillingPeriods(joinDate: Date, now: Date) {
  const dueDay = getDueDay(joinDate)
  const periods: {
    periodStart: string
    periodEnd: string
    dueDate: string
    billingKey: string
  }[] = []

  const firstPeriod = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 1)
  const current = new Date(firstPeriod)

  while (current <= now) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const monthStr = String(month + 1).padStart(2, '0')

    const lastDay = new Date(year, month + 1, 0).getDate()
    const dueDateObj = new Date(year, month, Math.min(dueDay, lastDay))

    periods.push({
      periodStart: `${year}-${monthStr}-01`,
      periodEnd: `${year}-${monthStr}-${lastDay}`,
      dueDate: dueDateObj.toISOString().split('T')[0],
      billingKey: `${year}-${monthStr}`,
    })

    current.setMonth(current.getMonth() + 1)
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
