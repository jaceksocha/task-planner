# Task Planner

A modern task planning application built with Astro 5, React 19, and Supabase. This project demonstrates AI-assisted development with comprehensive coding guidelines.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Astro](https://astro.build/) | ^5.13.7 | Web framework with hybrid rendering |
| [React](https://react.dev/) | ^19.1.1 | Interactive UI components |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.1.13 | Utility-first CSS framework |
| [Shadcn/ui](https://ui.shadcn.com/) | - | Accessible component library |
| [Supabase](https://supabase.com/) | - | Backend-as-a-Service |

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task-planner
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Configure the following variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key

4. Run database migrations (if applicable):

```bash
npx supabase db push
```

## Development

Start the development server:

```bash
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |

## Project Structure

```
task-planner/
├── src/
│   ├── layouts/        # Astro layouts
│   ├── pages/          # Astro pages and routes
│   │   └── api/        # API endpoints
│   ├── components/     # UI components (Astro & React)
│   │   ├── ui/         # Shadcn/ui components
│   │   └── hooks/      # Custom React hooks
│   ├── lib/            # Services and helpers
│   │   └── services/   # Business logic services
│   ├── db/             # Supabase clients and types
│   ├── middleware/     # Astro middleware
│   ├── types.ts        # Shared types (Entities, DTOs)
│   ├── styles/         # Global styles
│   └── assets/         # Static internal assets
├── public/             # Public assets
├── supabase/
│   └── migrations/     # Database migrations
├── .cursor/rules/      # AI rules for Cursor IDE
└── .claude/            # AI guidelines for Claude Code
```

## AI Development Support

This project is configured with comprehensive AI coding guidelines to ensure consistent, high-quality code generation.

### Cursor IDE

AI rules are located in `.cursor/rules/`:

| Rule File | Purpose |
|-----------|---------|
| `shared.mdc` | General project rules and structure |
| `frontend.mdc` | Tailwind styling and accessibility |
| `astro.mdc` | Astro-specific patterns |
| `react.mdc` | React hooks and functional components |
| `backend.mdc` | API and Supabase patterns |
| `api-supabase-astro-init.mdc` | Supabase initialization guide |
| `db-supabase-migrations.mdc` | Database migration guidelines |
| `ui-shadcn-helper.mdc` | Shadcn/ui component usage |

### Claude Code

Project guidelines for Claude Code are in `.claude/CLAUDE.md`.

### Key Conventions

- **Components**: Functional React components with TypeScript
- **Styling**: Tailwind CSS with responsive and dark mode variants
- **Accessibility**: ARIA attributes and keyboard navigation
- **State**: React hooks (useState, useCallback, useMemo)
- **API**: Astro server endpoints with Zod validation
- **Database**: Supabase with RLS policies

## Shadcn/ui Components

Install new components using:

```bash
npx shadcn@latest add [component-name]
```

Components use the "new-york" variant style with "neutral" base color.

## Contributing

1. Follow the AI guidelines in `.cursor/rules/` and `.claude/CLAUDE.md`
2. Run `npm run lint` before committing
3. Use meaningful commit messages

## License

MIT
