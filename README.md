# 🔨 Artisan Marketplace

A modern, responsive web application connecting customers with local artisans and repair professionals. Verified artisans, easy booking, real-time messaging — no payments required.

> **⚠️ No payment/billing features are included by design.** Customers arrange payment directly with artisans on-site.

## Executive Summary — Stack & Trade-offs

| Layer | Choice | Why |
|-------|--------|-----|
| **Full-Stack** | Next.js 14 (App Router) | SSR + API routes in one repo; great SEO, hybrid rendering, built-in image optimization |
| **ORM** | Prisma | Type-safe queries, auto-migrations, SQLite (dev) / PostgreSQL (prod) support |
| **Auth** | NextAuth.js (Auth.js) | Battle-tested JWT + session strategies, CSRF protection, extensible providers |
| **Real-time** | Server-Sent Events (SSE) | Simpler than WebSockets, works through proxies/CDNs, fits notification use case |
| **CSS** | Vanilla CSS + Custom Properties | Zero runtime overhead, full control, strong design token system |
| **i18n** | next-intl + JSON catalogs | Lightweight, App Router compatible, supports server components |
| **Queue** | In-process (production: BullMQ + Redis) | Lightweight for dev; documented upgrade path |

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 9
- **Docker** (optional, for containerized setup)

## Quick Start (Local Development)

```bash
# 1. Clone and install
git clone <repo-url> && cd artisan-marketplace
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values (the defaults work for local dev)

# 3. Initialize database
npx prisma migrate dev --name init
npx prisma generate

# 4. Seed demo data
npm run db:seed

# 5. Start development server
npm run dev
# Open http://localhost:3000
```

## Docker Setup

```bash
# Build and run all services (app + PostgreSQL + Mailpit)
docker-compose up --build

# App: http://localhost:3000
# Mailpit (email testing): http://localhost:8025
# PostgreSQL: localhost:5432
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@artisan-marketplace.local | Password1! |
| **Customer** | sarah@example.com | Password1! |
| **Customer** | ahmed@example.com | Password1! |
| **Artisan** | karim@example.com | Password1! |
| **Artisan** | fatima@example.com | Password1! |

> All demo accounts use password: `Password1!`

## Common Commands

```bash
npm run dev           # Start dev server
npm run build         # Build production bundle
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm test              # Run tests
npm run test:coverage # Tests with coverage report
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio (DB GUI)
npm run db:reset      # Reset and re-seed database
```

## Core Features

### For Customers
- 🔍 Search artisans by service, location, rating
- 📅 Book services with date/time selection
- 💬 Real-time messaging with artisans
- ⭐ Rate and review completed services
- ❤️ Favorite artisans for quick access
- 🔔 In-app and email notifications

### For Artisans
- 📋 Professional profile with portfolio
- 📆 Availability calendar management
- ✅ Accept/decline booking requests
- 📊 Track booking lifecycle
- 💬 Chat with customers

### For Admins
- 👥 User management (activate/deactivate)
- ✅ Artisan approval workflow
- 📝 Review moderation
- 📂 Category management
- 📊 Dashboard metrics

## Project Structure

```
artisan-marketplace/
├── prisma/                 # DB schema, migrations, seed
├── src/
│   ├── app/                # Next.js App Router pages + API routes
│   │   ├── (auth)/         # Sign in, sign up, verify, reset
│   │   ├── api/            # REST API endpoints
│   │   ├── dashboard/      # Customer dashboard
│   │   ├── artisan/        # Artisan dashboard
│   │   └── admin/          # Admin panel
│   ├── components/         # Reusable React components
│   ├── lib/                # Core utilities (auth, email, upload, etc.)
│   ├── services/           # Business logic layer
│   └── i18n/               # Translation files (EN, FR)
├── tests/                  # Unit + integration tests
├── docs/                   # Documentation
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # Full-stack local setup
└── .github/workflows/      # CI pipeline
```

## Architecture Decisions

### Separation of Concerns
- **API Routes** — thin controllers, handle HTTP only
- **Services** — business logic, validation, side effects
- **Lib** — shared utilities (auth, email, rate limiting, upload)
- **Prisma** — data access, no raw SQL

### Security
- JWT in HttpOnly cookies (CSRF-resistant)
- Bcrypt password hashing (cost factor 12)
- Rate limiting on auth and booking endpoints
- Input validation with Zod on every endpoint
- File upload: MIME verification, magic bytes check, filename sanitization
- Security headers: CSP, HSTS, X-Frame-Options, X-XSS-Protection
- SQL injection prevention via Prisma parameterized queries

### Performance
- Server-side rendering for SEO-critical pages
- Pagination on all list endpoints
- Database indexes on filtered/searched columns
- Image optimization via Next.js `<Image>`
- Standalone Docker output (minimal image)

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Production Deployment

### Environment Variables
See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `SMTP_*` — email provider credentials

### Recommended Hosting
- **Vercel** — easiest for Next.js, zero-config
- **Render** — Docker support, managed PostgreSQL
- **DigitalOcean App Platform** — docker-compose compatible

### Quick Deploy
```bash
# Vercel (if using Vercel)
npx vercel --prod

# Docker (any VPS)
docker-compose -f docker-compose.yml up -d
```

## Roadmap (Future Improvements)

1. 💳 Optional payment integration (Stripe) — currently pay-on-site
2. 🤖 ML-based service price suggestions
3. 🗺️ Map-based artisan search with geolocation
4. 📱 Progressive Web App (PWA) support
5. 🔄 Advanced matching algorithm (availability + skill + proximity)
6. 📊 Analytics dashboard for artisans
7. 🌍 Multi-city scaling with region-based routing
8. 📸 Before/after photo gallery for completed work

## License

MIT
# artisan-project
