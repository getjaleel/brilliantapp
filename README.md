# Architecture Navigator

Enterprise-grade architecture engagement guide for professional services. Built for Australian government and enterprise consulting engagements with AI-powered architecture advisory.

## Context

This application solves a real problem in professional services architecture engagements:

- **Problem**: Architecture consultants lack structured tooling to guide clients through discovery → current state → target state → compliance → roadmap lifecycle
- **Solution**: A guided engagement platform with AI assistance, compliance tracking (ISM, Essential Eight), and artefact generation
- **Differentiator**: Native RDS IAM authentication for secure AWS Aurora PostgreSQL access without static passwords

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | AWS Aurora PostgreSQL 16 |
| Auth | AWS IAM RDS Auth + Vercel OIDC |
| ORM | Prisma 5.20 |
| AI | Ollama (local) / OpenAI compatible |

### Database Authentication (Critical)

This project uses **AWS IAM authentication** instead of static passwords. The RDS Signer generates temporary auth tokens valid for 15 minutes.

\`\`\`
Vercel Runtime → OIDC Token → AWS STS AssumeRole → RDS Signer → IAM Auth Token → Aurora
\`\`\`

Local development uses the same flow after running \`vercel env pull\`.

## Prerequisites

- Node.js 20+
- Vercel CLI: \`npm i -g vercel\`
- AWS CLI configured (for local RDS access)
- Vercel account linked to AWS Aurora Marketplace integration

## Environment Variables

Pull from Vercel (includes IAM role + OIDC token):

\`\`\`bash
vercel env pull
\`\`\`

Required variables:

\`\`\`
PGHOST=aws-apg-yellow-lantern.cluster-ckxcy00y4d0n.us-east-1.rds.amazonaws.com
PGPORT=5432
PGUSER=postgres
PGDATABASE=postgres
PGSSLMODE=require
AWS_REGION=us-east-1
AWS_ROLE_ARN=arn:aws:iam::342946498055:role/Vercel/access-apg-yellow-lantern
AWS_RESOURCE_ARN=arn:aws:rds:us-east-1:342946498055:cluster:aws-apg-yellow-lantern
\`\`\`

Optional:

\`\`\`
DATABASE_URL=postgresql://...   # Fallback for password auth
PGPASSWORD=...                  # Static password fallback
OLLAMA_BASE_URL=http://192.168.1.237:11434
AI_ENABLED=true
\`\`\`

## Quick Start

### 1. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Link Vercel project

\`\`\`bash
vercel link
# Select: getjaleel-gmailcoms-projects/brilliantapp
\`\`\`

### 3. Pull environment variables

\`\`\`bash
vercel env pull
\`\`\`

### 4. Create database tables

\`\`\`bash
# Option A: Via API (Vercel)
curl https://your-deployment.vercel.app/api/setup-db

# Option B: Via Prisma (local with valid AWS creds)
npx prisma db push
\`\`\`

### 5. Start development server

\`\`\`bash
npm run dev
# Opens on http://localhost:3002
\`\`\`

## Project Structure

\`\`\`
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard (resilient to missing tables)
│   ├── layout.tsx                # Root layout with sidebar
│   ├── status/page.tsx           # RDS connectivity test
│   ├── comments/page.tsx         # Aurora test page
│   ├── projects/page.tsx         # Project list
│   ├── projects/[id]/page.tsx    # Project detail
│   ├── engagement/[projectId]/page.tsx
│   ├── artefacts/[projectId]/page.tsx
│   ├── compliance/[projectId]/page.tsx
│   ├── knowledge/page.tsx       # Knowledge base
│   ├── roadmap/page.tsx          # Architecture roadmap
│   ├── settings/page.tsx         # App settings
│   └── api/
│       ├── test-db/route.ts     # DB connectivity check
│       └── setup-db/route.ts     # Schema creation + seeding
├── lib/
│   ├── db.ts                     # RDS IAM auth pool (pg)
│   └── prisma.ts                 # PrismaClient singleton
├── components/
│   └── ui/                       # shadcn components
└── ...

prisma/
├── schema.prisma                 # Full data model
└── migration.sql                 # Generated SQL
\`\`\`

## Database Schema

### Core Entities

| Entity | Purpose |
|--------|---------|
| **Organisation** | Consulting firm / practice |
| **Client** | Customer being engaged |
| **Project** | Architecture engagement with lifecycle phases |
| **EngagementPhase** | Discovery, Current State, Target Architecture, Risk, Compliance |
| **Risk** | Architecture and migration risks with impact/probability |
| **Control** | ISM / Essential Eight compliance mapping |
| **Artefact** | Generated deliverables (ADRs, principles, registers) |
| **KnowledgeItem** | TOGAF, AWS Well-Architected, Cyber patterns |
| **Decision** | Architecture Decision Records (ADRs) |
| **RoadmapItem** | Short/medium/long term migration items |

### Relationships

\`\`\`
Organisation → Client → Project → [Phase, Risk, Control, Artefact, Stakeholder]
                                     ↓
                              AIConversation → AIMessage
\`\`\`

## Key Features

### 1. Resilient Dashboard
Homepage renders even when database tables are missing, showing a "Database Setup Required" prompt with one-click schema creation.

### 2. IAM Authentication
No static passwords in Vercel. Uses \`@vercel/functions/oidc\` + \`@aws-sdk/rds-signer\` to generate temporary tokens.

### 3. Dynamic Server Rendering
All data-fetching pages export \`dynamic = "force-dynamic"\` to prevent build-time database queries that fail in CI/CD.

### 4. AI Architecture Advisor
Sidebar integration with Ollama for:
- Discovery questionnaire generation
- Control gap analysis
- Phase completion recommendations

### 5. Engagement Lifecycle
Guided phases with:
- Phase requirements & tasks
- Risk register with impact scoring
- Compliance tracker (ISM, PSPF, Essential Eight)
- Artefact generator

## Deployment

### Production

\`\`\`bash
vercel --prod
\`\`\`

Or push to \`main\` — Git integration auto-deploys.

### Database Setup (First Deploy)

After first Vercel deploy, visit:

\`\`\`
https://<your-app>.vercel.app/api/setup-db
\`\`\`

This creates all tables and seeds sample data (Acme Corp demo project).

## Troubleshooting

### "PAM authentication failed"
- Check \`AWS_ROLE_ARN\` and \`AWS_REGION\` are set in Vercel dashboard
- Verify RDS IAM database authentication is enabled on the Aurora cluster
- Ensure IAM role trust policy allows \`oidc.vercel.com\`

### "relation 'Project' does not exist"
Visit \`/api/setup-db\` to create tables. Homepage will show "Run Setup" button if tables missing.

### "Failed to open database" (Turbopack warning)
Non-fatal Turbopack internal message. Ignore if \`/api/test-db\` returns \`{"ok": true}\`.

### Local dev: "The security token included in the request is invalid"
AWS CLI creds expired. Run \`aws sso login\` or \`aws configure\` to refresh.

## Security

- **No static DB passwords in production** — IAM auth tokens rotate every 15 minutes
- **SSL required** — \`PGSSLMODE=require\` enforced
- **Vercel OIDC** — Role assumption via short-lived OIDC tokens, no long-term AWS keys
- **Row-level isolation** — Multi-tenant via \`organisationId\` on all entities

## License

MIT — Built for architecture consulting engagements.
