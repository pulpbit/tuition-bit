# Tuition Bit — AI Agent Guidelines

## Database Safety Rules

**Never run `schema.sql` against a database with data** — it's for fresh setups only.

### All schema changes must use D1 Migrations:

```bash
cd backend
npx wrangler d1 migrations create tuition-bit-db description
# Edit the created file in backend/migrations/
npx wrangler d1 migrations apply tuition-bit-db --remote
```

### Rules:
- `CREATE TABLE IF NOT EXISTS` — never bare `CREATE TABLE`
- `CREATE INDEX IF NOT EXISTS` — never bare `CREATE INDEX`
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — for new columns
- Never `DROP TABLE`, `DROP COLUMN`, or `ALTER TABLE DROP`
- Test with `--local` before `--remote`
