# Tech Stack: Task Planner

## Overview

This document describes the technology stack chosen for the Task Planner application, including versions, purposes, and rationale for each choice.

---

## Frontend

### Framework: Astro 5
- **Version:** ^5.13.7
- **Purpose:** Web framework with hybrid rendering (SSR + static)
- **Why:**
  - Fast page loads with minimal JavaScript
  - Islands architecture for selective hydration
  - Built-in support for React components
  - Server-side rendering for SEO and initial load
  - View Transitions API for smooth navigation

### UI Library: React 19
- **Version:** ^19.1.1
- **Purpose:** Interactive UI components
- **Why:**
  - Declarative component model
  - Hooks for state management
  - Large ecosystem and community
  - Excellent TypeScript support
  - Used only where interactivity is needed (islands)

### Language: TypeScript 5
- **Version:** 5.x (via tsconfig)
- **Purpose:** Type-safe JavaScript
- **Why:**
  - Catch errors at compile time
  - Better IDE support and autocomplete
  - Self-documenting code
  - Required for Astro/React integration

---

## Styling

### CSS Framework: Tailwind CSS 4
- **Version:** ^4.1.13
- **Purpose:** Utility-first CSS framework
- **Why:**
  - Rapid UI development
  - Consistent design tokens
  - Small production bundle (purges unused CSS)
  - Dark mode support
  - Responsive design utilities
  - AI-friendly class names

### Component Library: Shadcn/ui
- **Style:** new-york variant
- **Color:** neutral base
- **Purpose:** Accessible, customizable React components
- **Why:**
  - Built on Radix UI primitives
  - Full code ownership (not a dependency)
  - Tailwind integration
  - Accessibility (a11y) built-in
  - Easy to customize

### Supporting Libraries
- `class-variance-authority` (^0.7.1) - Component variant management
- `clsx` (^2.1.1) - Conditional class names
- `tailwind-merge` (^3.1.0) - Merge Tailwind classes intelligently
- `lucide-react` (^0.487.0) - Icon library

---

## Backend

### Backend-as-a-Service: Supabase
- **Purpose:** Database, Auth, Storage, Edge Functions
- **Why:**
  - PostgreSQL database with full SQL support
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Auto-generated TypeScript types
  - Generous free tier

### Database: PostgreSQL (via Supabase)
- **Features used:**
  - Tables with foreign keys
  - Row Level Security policies
  - UUID primary keys
  - Timestamps (created_at, updated_at)

### Authentication: Supabase Auth
- **Methods:** Email/password
- **Features:**
  - Session management
  - JWT tokens
  - Middleware integration

---

## AI Integration

### LLM Proxy: OpenRouter
- **Purpose:** Unified access to multiple AI models
- **Why:**
  - Pay-as-you-go pricing
  - Free tier available
  - Easy model switching
  - Structured outputs support (JSON schema)

### Models (planned)
- `google/gemini-2.0-flash-exp:free` - Free tier for development
- `openai/gpt-4o-mini` - Low-cost production option

---

## Development Tools

### Code Quality
| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.23.0 | Linting |
| Prettier | (via plugin) | Code formatting |
| TypeScript ESLint | 8.28.0 | TypeScript linting |
| eslint-plugin-astro | 1.3.1 | Astro-specific rules |
| eslint-plugin-react | 7.37.4 | React best practices |
| eslint-plugin-jsx-a11y | 6.10.2 | Accessibility linting |

### Git Hooks
| Tool | Version | Purpose |
|------|---------|---------|
| Husky | 9.1.7 | Git hooks management |
| lint-staged | 15.5.0 | Run linters on staged files |

### Runtime
- **Node.js:** v22.14.0 (specified in `.nvmrc`)
- **Package Manager:** npm

---

## Project Structure

```
task-planner/
├── src/
│   ├── layouts/        # Astro layouts (Layout.astro)
│   ├── pages/          # Astro pages and routes
│   │   └── api/        # REST API endpoints
│   ├── components/     # UI components
│   │   ├── ui/         # Shadcn/ui components
│   │   └── hooks/      # Custom React hooks
│   ├── lib/            # Services and helpers
│   │   ├── services/   # Business logic
│   │   └── utils.ts    # Utility functions
│   ├── db/             # Supabase clients and types
│   ├── middleware/     # Astro middleware
│   ├── types.ts        # Shared types (DTOs, entities)
│   ├── styles/         # Global CSS
│   └── env.d.ts        # Environment type definitions
├── public/             # Static assets
├── supabase/
│   └── migrations/     # Database migrations
├── .ai/                # AI context files
│   ├── prd.md          # Product requirements
│   └── tech-stack.md   # This file
├── .cursor/rules/      # Cursor IDE AI rules
└── .claude/            # Claude Code guidelines
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind (if customized) |
| `components.json` | Shadcn/ui configuration |
| `eslint.config.js` | ESLint flat config |
| `.nvmrc` | Node.js version |
| `.env` | Environment variables (not committed) |

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# OpenRouter (Lesson 21)
OPENROUTER_API_KEY=your_openrouter_key
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |

---

## Version Compatibility Notes

- Tailwind CSS 4 requires specific shadcn/ui configuration (avoid `--defaults` flag)
- React 19 is compatible with latest shadcn/ui components
- Astro 5 uses new Content Layer API
- Node.js 22 is required for latest ESM features
