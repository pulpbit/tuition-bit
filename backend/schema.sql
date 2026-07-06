CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL, -- Clerk Organization ID or User ID
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  school TEXT NOT NULL,
  board TEXT,
  whatsapp TEXT,
  monthly_fee INTEGER NOT NULL,
  joining_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_tutor ON students(tutor_id);

CREATE TABLE IF NOT EXISTS fees_cycles (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'paid', 'pending', 'overdue'
  due_date TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fees_student ON fees_cycles(student_id);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  billing_period TEXT NOT NULL, -- e.g., '2023-10'
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent'
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tutor_settings (
  tutor_id TEXT PRIMARY KEY,
  plan_type TEXT DEFAULT 'trial',
  trial_ends_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_reminders (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  due_date TEXT NOT NULL,
  reminder_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL,
  student_name TEXT NOT NULL,
  parent_name TEXT,
  whatsapp TEXT,
  monthly_fee INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_org ON fee_reminders(org_id);
CREATE INDEX IF NOT EXISTS idx_reminders_student ON fee_reminders(student_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON fee_reminders(status);
