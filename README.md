# 🏠 PropFind — Real Estate Directory

Subscription-based real estate listing platform. Agents pay to list unlimited properties. Buyers browse and contact agents directly via phone/WhatsApp. Zero commission.

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **PostgreSQL** via **Supabase**
- **Drizzle ORM**
- **Tailwind CSS 4**
- **JWT authentication** (jose + bcryptjs)
- **Vercel** deployment

---

## 🚀 Deployment

### 1. Clone & Install

```bash
git clone https://github.com/sammynews4u/estate-agency.git
cd estate-agency
npm install
```

### 2. Local .env

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://postgres:Toluwase2020@db.ktbfrwlxhbufufnaavjc.supabase.co:5432/postgres
JWT_SECRET=propfind-jwt-secret-key-samuel-adesanya-2024-secure
```

### 3. Push Database Schema

```bash
npx drizzle-kit push
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and click **"Load Demo Data"** or run:

```bash
curl -X POST http://localhost:3000/api/seed
```

### 5. Deploy to Vercel

```bash
git add .
git commit -m "PropFind MVP"
git push origin main
```

Then on **vercel.com**:
1. Import `sammynews4u/estate-agency`
2. Add Environment Variables:
   - `DATABASE_URL` = `postgresql://postgres:Toluwase2020@db.ktbfrwlxhbufufnaavjc.supabase.co:5432/postgres`
   - `JWT_SECRET` = `propfind-jwt-secret-key-samuel-adesanya-2024-secure`
3. Deploy

### 6. Seed Production Data

After Vercel deploys, visit:
```
https://YOUR-APP.vercel.app/api/seed
```
(POST request — or use the "Load Demo Data" button on the homepage)

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | samuel.adesanya1love@gmail.com | admin123 |
| Agent | marie.nguema@gmail.com | agent123 |
| Agent | jean.mballa@gmail.com | agent123 |
| Agent | fatima.bello@gmail.com | agent123 |
| Agent | paul.etoga@gmail.com | agent123 |
| Agent | sarah.kamga@gmail.com | agent123 |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # 27 API routes
│   ├── admin/            # Admin dashboard
│   ├── agents/           # Agent directory + profiles
│   ├── dashboard/        # Agent dashboard + listing CRUD
│   ├── listings/         # Browse + detail pages
│   ├── saved/            # Saved properties
│   ├── login/            # Login
│   ├── register/         # Register
│   └── page.tsx          # Homepage
├── components/           # 16 React components
├── db/
│   ├── index.ts          # Lazy DB connection (Vercel-safe)
│   └── schema.ts         # 8 Drizzle tables
└── lib/
    ├── auth.ts           # JWT + bcrypt
    ├── types.ts          # TypeScript types + constants
    └── visitor.ts        # Client-side visitor tracking
```

---

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Start production
npm run db:push   # Push schema to database
npm run db:studio # Open Drizzle Studio
```
