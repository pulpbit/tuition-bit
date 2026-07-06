# Tuition Bit – Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`
- Login: `wrangler login`

---

## Step 1: Create D1 Database

Run this once to create the production database:

```bash
cd backend
wrangler d1 create tuition-bit-db
```

Copy the **database_id** from the output and update `backend/wrangler.json`:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tuition-bit-db",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

---

## Step 2: Apply Schema to Production D1

**⚠️ WARNING:** Never run `schema.sql` against an existing database — it's for fresh setups only.
Use **D1 Migrations** instead (see Appendix A).

### Fresh database (first time only):
```bash
cd backend
wrangler d1 execute tuition-bit-db --remote --file=schema.sql
```

### Existing database (safe — uses `CREATE TABLE IF NOT EXISTS`):
```bash
cd backend
wrangler d1 migrations apply tuition-bit-db --remote
```

---

## Step 3: Add Clerk Secrets to Worker

```bash
wrangler secret put CLERK_PUBLISHABLE_KEY
# Enter: pk_test_dXAtYmVldGxlLTE4LmNsZXJrLmFjY291bnRzLmRldiQ

wrangler secret put CLERK_SECRET_KEY
# Enter: sk_test_vs0pxdqWGsGH6tISMD0D65Nq8P7L23ylfSGZmVGU4b
```

---

## Step 4: Deploy Backend (Cloudflare Workers)

```bash
cd backend
wrangler deploy
```

After deploy, you'll get a URL like:
`https://tuition-bit-api.<your-subdomain>.workers.dev`

---

## Step 5: Update Frontend API URL

Update your frontend `.env.production` file:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dXAtYmVldGxlLTE4LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_API_URL=https://tuition-bit-api.<your-subdomain>.workers.dev
```

Then update all `http://localhost:8787` references in frontend to use `import.meta.env.VITE_API_URL`.

---

## Step 6: Build Frontend

```bash
cd frontend
npm run build
```

---

## Step 7: Deploy Frontend (Cloudflare Pages)

Option A – Wrangler CLI:
```bash
cd frontend
wrangler pages deploy dist --project-name=tuition-bit
```

Option B – GitHub integration (recommended):
1. Push project to GitHub
2. In Cloudflare Dashboard → Pages → Create project → Connect GitHub repo
3. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend`
4. Add environment variable: `VITE_CLERK_PUBLISHABLE_KEY`

---

## Step 8: Add Deployed Pages URL to Clerk Dashboard

In Clerk Dashboard → Settings → Allowed Origins, add:
- `https://tuition-bit.pages.dev` (or your custom domain)

Also update `backend/src/index.ts` CORS to allow the production domain.

---

## Appendix A: D1 Migration Workflow

Use this for **all future schema changes** to avoid data loss.

### Create a new migration
```bash
cd backend
npx wrangler d1 migrations create tuition-bit-db description_of_change
```

Edit the generated file in `backend/migrations/` with your SQL.

### Apply migrations to production
```bash
cd backend
npx wrangler d1 migrations apply tuition-bit-db --remote
```

### Apply migrations to local dev
```bash
cd backend
npx wrangler d1 migrations apply tuition-bit-db --local
```

### Rules
- Never `DROP TABLE` — use `CREATE TABLE IF NOT EXISTS` for new tables
- Never `ALTER TABLE DROP COLUMN` — that would delete data
- For new columns: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Always test with `--local` first, then `--remote`
