# AGENT.md - Real Estate App Development Guide

## Commands
- **Dev**: `npm run dev` (Next.js with Turbopack on 0.0.0.0)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start**: `npm start`
- **No test runner configured** - no test commands available

## Architecture
- Next.js 15 app with App Router, React 19, TypeScript/JSX
- Auth: NextAuth.js with role-based access (ADMIN, USER)
- State: React Query (@tanstack/react-query) for server state
- UI: Tailwind CSS + Flowbite React components
- Structure: `src/app/` (pages), `src/components/` (reusable), `src/hooks/` (data fetching), `src/data/` (mock data)
- Protected routes: `/dashboard`, `/buyers`, `/units`, `/payments`, `/invoices`

## Code Style
- **Imports**: Use `@/` alias for src imports, group external → internal → relative
- **Components**: Use 'use client' for client components, PascalCase naming
- **Hooks**: Custom hooks in `src/hooks/`, prefix with `use`
- **Styling**: Tailwind classes, Flowbite components
- **Data**: React Query hooks for API calls, mock data in `src/data/`
- **Auth**: Use `useSession()` hook, check roles with `hasPermission()`
- **File naming**: kebab-case for files, PascalCase for components
