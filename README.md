# 💪 Fitness & Wellbeing App

A production-ready Next.js fitness application with real health integrations, AI-powered recommendations, and subscription management.

## 🚀 Features

- **Health Integrations**: Vital, Terra, Polar AccessLink, Google Fit
- **AI Recommendations**: Daily training suggestions based on HRV, sleep, and recovery metrics
- **Subscription Management**: Stripe-powered monthly subscriptions
- **Trainer Directory**: Find and connect with certified trainers
- **Comprehensive Tracking**: Workouts, metrics, mood, stress, hydration, and more
- **Minimalist Design**: Black & white, accessible (WCAG AA), fast (Core Web Vitals)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **UI**: shadcn/ui + Radix, Tailwind CSS (grayscale)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth (email magic link + OAuth)
- **Payments**: Stripe
- **AI**: OpenAI
- **Testing**: Vitest + Testing Library + Playwright
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 16+

## 🏃 Getting Started

1. **Clone and install dependencies**:

```bash
pnpm install
```

2. **Set up environment variables**:

```bash
cp env.example .env.local
# Edit .env.local with your credentials
```

3. **Set up the database**:

```bash
pnpm db:push
pnpm db:seed
```

4. **Run the development server**:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Unit tests with coverage
pnpm test:unit

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui

# Run full verification (lint, typecheck, tests, build)
pnpm verify
```

## 📦 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with test data

## 📚 Documentation

- [Architecture](./docs/architecture.md) - System architecture and design patterns
- [Tasks](./docs/tasks.md) - Implementation checklist and progress
- [API](./docs/api.md) - API endpoints and webhooks

## 🔐 Environment Variables

See `env.example` for all required and optional environment variables.

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - NextAuth secret key

### Optional (for full functionality)

- `RESEND_API_KEY` - Email magic links
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `STRIPE_SECRET_KEY` - Stripe payments
- `OPENAI_API_KEY` - AI recommendations
- `VITAL_API_KEY` - Vital health data
- `TERRA_API_KEY` - Terra health data
- `POLAR_CLIENT_ID` - Polar AccessLink
- `GOOGLE_FIT_CLIENT_ID` - Google Fit

## 🏗️ Project Structure

```
.
├── docs/              # Documentation
├── prisma/            # Database schema and migrations
├── src/
│   ├── app/          # Next.js App Router pages & API routes
│   ├── components/   # React components
│   ├── core/         # Business logic (domain, services, ports)
│   ├── integrations/ # External service adapters
│   └── lib/          # Shared utilities
├── tests/
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── e2e/          # End-to-end tests
└── .github/          # CI/CD workflows
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm verify` to ensure all checks pass
4. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

Built with TDD principles and clean architecture patterns for production readiness.
