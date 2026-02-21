# JaiHoIndia News

A full-stack Hindi/English news aggregation platform.

## Architecture

- **Frontend** — Vite + React + TypeScript, deployed on [Vercel](https://vercel.com)
- **Backend** — Node.js Express API, deployed on [Render](https://render.com)
- **Database** — [Supabase](https://supabase.com) (PostgreSQL + Storage)

## Local Development

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
node server.js
```

### Environment Variables

**Frontend** (`.env.local`):
```
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend** (`backend/.env`):
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
NEWSDATA_API_KEY=your_key
FRONTEND_URL=http://localhost:5173
```

## Deployment

- Frontend → push to `main`, Vercel auto-deploys
- Backend → push to `main`, Render auto-deploys
- Set `VITE_BACKEND_URL` in Vercel env vars to your Render URL
- Set `FRONTEND_URL` in Render env vars to your Vercel URL
