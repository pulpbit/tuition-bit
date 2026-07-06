# Tuition Bit — Progress & Remaining Work

## ✅ Completed

### Fee Reminder Module (MVP)
- [x] `fee_reminders` table (with metadata columns + indexes)
- [x] Cron logic: auto-creates Reminder #1 (1 day after due) and Reminder #2 (2 days after R1)
- [x] Manual trigger endpoint: `POST /api/trigger-reminders`
- [x] API: `GET /api/reminders`, `POST /api/reminders/:id/sent`, `POST /api/reminders/:id/dismiss`
- [x] Frontend: `/reminders` page with reminder cards
- [x] Send via WhatsApp (opens `wa.me` with pre-filled message)
- [x] Send All (sequential queue with progress + confirmation)
- [x] Dashboard widget showing pending reminder count
- [x] Nav item in sidebar + bottom tab

### Bulk Student Import
- [x] `POST /api/students/bulk` endpoint (JSON array)
- [x] BulkImportModal UI (file upload, paste, sample button)
- [x] "Bulk Import" button on Students page

### Data Safety
- [x] `schema.sql` uses `CREATE TABLE IF NOT EXISTS` (no more DROPs)
- [x] D1 migration system set up (`backend/migrations/`)
- [x] `AGENTS.md` with database safety rules
- [x] `DEPLOYMENT.md` updated with migration workflow

### Fixes
- [x] Billing periods are anniversary-based (post-paid model)
- [x] Message template updated with WhatsApp bold formatting

## 🔜 For Later (Not Started)

### Admin Panel
- No admin dashboard exists
- No way to track all teachers using the app
- Needed: admin users, teacher list, stats overview

### Plan/Subscription System
- `tutor_settings` table exists but unused
- No plan gating, no limits, no payment flow
- No registration restrictions

### Other Known Gaps
- Search field on StudentsList is visual-only (no filtering logic)
- No user-facing error messages/toast system
- No form validation beyond HTML `required`
- No shared types between frontend and backend
- No testing infrastructure
- `apiFetch` helper in `lib/api.ts` is unused by pages
