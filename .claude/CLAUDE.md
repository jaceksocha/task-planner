# Project: Task Planner

## Tech Stack

- Astro 5
- TypeScript 5
- React 19
- Tailwind 4
- Shadcn/ui
- Supabase

## Project Structure

- `src/layouts` - Astro layouts
- `src/pages` - Astro pages
- `src/pages/api` - API endpoints
- `src/middleware/index.ts` - Astro middleware
- `src/db` - Supabase clients and types
- `src/types.ts` - Shared types for backend and frontend (Entities, DTOs)
- `src/components` - Client-side components written in Astro (static) and React (dynamic)
- `src/components/ui` - Client-side components from Shadcn/ui
- `src/lib` - Services and helpers
- `src/assets` - Static internal assets
- `public` - Public assets

## Coding Guidelines

### Clean Code

- Use feedback from linters to improve the code when making changes
- Prioritize error handling and edge cases
- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions to avoid deeply nested if statements
- Place the happy path last in the function for improved readability
- Avoid unnecessary else statements; use if-return pattern instead
- Use guard clauses to handle preconditions and invalid states early
- Implement proper error logging and user-friendly error messages

### Astro

- Use `export const prerender = false` for API routes
- Use POST, GET (uppercase) for endpoint handlers
- Use zod for input validation in API routes
- Extract logic into services in `src/lib/services`
- Leverage View Transitions API for smooth page transitions (use ClientRouter)
- Use content collections with type safety for blog posts, documentation, etc.
- Use Astro.cookies for server-side cookie management
- Leverage import.meta.env for environment variables

### React

- Use functional components with hooks instead of class components
- Never use "use client" and other Next.js directives (this is Astro, not Next.js)
- Extract logic into custom hooks in `src/components/hooks`
- Implement React.memo() for expensive components that render often with the same props
- Use useCallback for event handlers passed to child components
- Prefer useMemo for expensive calculations
- Implement useId() for generating unique IDs for accessibility attributes
- Use useTransition for non-urgent state updates to keep the UI responsive

### Supabase

- Use supabase from `context.locals` in Astro routes instead of importing supabaseClient directly
- Use SupabaseClient type from `src/db/supabase.client.ts`, not from `@supabase/supabase-js`
- Follow Supabase guidelines for security and performance
- Use Zod schemas to validate data exchanged with the backend

### Database Migrations

- Location: `supabase/migrations/`
- File naming: `YYYYMMDDHHmmss_short_description.sql` (e.g., `20240906123045_create_profiles.sql`)
- Write all SQL in lowercase
- Include a header comment with metadata about the migration (purpose, affected tables/columns)
- Add copious comments for any destructive SQL commands (truncate, drop, column alterations)
- Always enable Row Level Security (RLS) even if the table is intended for public access
- RLS Policies should be granular: one policy per operation (select, insert, update, delete) and per role (anon, authenticated)
- DO NOT combine policies even if the functionality is the same for both roles
- Include comments explaining the rationale and intended behavior of each security policy

### Styling with Tailwind

- Use the @layer directive to organize styles into components, utilities, and base layers
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus-visible:, active:, etc.) for interactive elements

### Accessibility (ARIA)

- Use ARIA landmarks to identify regions of the page (main, navigation, search, etc.)
- Apply appropriate ARIA roles to custom interface elements
- Set aria-expanded and aria-controls for expandable content
- Use aria-live regions for dynamic content updates
- Apply aria-label or aria-labelledby for elements without visible text labels
- Use aria-describedby to associate descriptive text with form inputs
- Avoid redundant ARIA that duplicates the semantics of native HTML elements

### Shadcn/ui

- Components are located in `src/components/ui`
- Import using the `@/` alias: `import { Button } from "@/components/ui/button"`
- Install new components: `npx shadcn@latest add [component-name]`
- Do NOT use deprecated `npx shadcn-ui@latest`
- Project uses "new-york" variant style with "neutral" base color
