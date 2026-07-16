# Task Manager — Frontend

React 19 + TypeScript frontend for the Task Manager app, built with Vite and Tailwind CSS v4.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`. Start the backend first.

## Testing

```bash
npm test            # run tests once
npm run test:watch  # watch mode
```

Tests use **Vitest** and **React Testing Library**. Test files live in `src/__tests__/`.

## Build

```bash
npm run build     # type-check + Vite build → dist/
npm run preview   # preview the production build
```

## Linting

```bash
npm run lint      # oxlint
```
