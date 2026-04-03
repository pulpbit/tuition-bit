DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS fees_cycles;
DROP TABLE IF EXISTS tutor_settings;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL, -- Clerk Organization ID or User ID
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  school TEXT NOT NULL,
  board TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  whatsapp TEXT,
  monthly_fee INTEGER NOT NULL,
  joining_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_tutor ON students(tutor_id);

CREATE TABLE fees_cycles (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'paid', 'pending', 'overdue'
  due_date TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_fees_student ON fees_cycles(student_id);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  billing_period TEXT NOT NULL, -- e.g., '2023-10'
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent'
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE tutor_settings (
  tutor_id TEXT PRIMARY KEY,
  plan_type TEXT DEFAULT 'trial',
  trial_ends_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
