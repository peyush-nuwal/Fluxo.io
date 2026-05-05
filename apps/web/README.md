# Web App

Main product frontend built with Next.js App Router.

## Default Port

- `3000`

## Run

```bash
pnpm -C apps/web dev
pnpm -C apps/web build
pnpm -C apps/web start
```

## Runtime Dependencies

- `next`, `react`, `react-dom`
- `axios`, `zod`, `zustand`, `dayjs`, `nanoid`
- `@tanstack/react-query`, `@tanstack/react-table`
- `@xyflow/react`, `reactflow`
- `react-hook-form`, `@hookform/resolvers`
- `next-intl`, `next-themes`
- `@monaco-editor/react`
- Radix UI packages (`@radix-ui/*`, `cmdk`, `input-otp`)
- Styling/utilities: `tailwind-merge`, `class-variance-authority`, `clsx`, `sonner`, `motion`, `lucide-react`

## Dev Dependencies

- `typescript`, `eslint`, `eslint-config-next`
- `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`
- `@types/node`, `@types/react`, `@types/react-dom`
