# AGENTS.md

This file provides guidelines and commands for AI agents working in this repository.

## Build, Lint, and Test Commands

### Development

- `npm run dev` - Start Next.js development server

### Code Quality

- `npm run lint` - Run ESLint
- Note: No test framework is currently configured. Add tests using a test runner (e.g., Vitest, Jest) and update AGENTS.md.

## Code Style Guidelines

### Import Organization

Imports should follow this order:

1. React and core libraries
2. Third-party dependencies
3. Local imports (using `@/` alias for src directory)
4. Type imports (local types)

Example:

```typescript
import { FC, useMemo, useState } from "react";
import { omit } from "lodash";
import { Button } from "@/components/ui/button";
```

### Component Structure

- Define components with explicit types: `const Component: FC<Props> = ({ ... }) => { ... }`
- Use named exports: `export { Component };`
- Keep components small and focused (< 200 lines when possible)

### Type Definitions

- Use `type` instead of `interface` for type definitions
- Define Props explicitly for each component
- Use `FC` type from React for functional components
- Use `ReactNode` for children prop

Example:

```typescript
type Props = {
  children?: ReactNode;
  data?: Doc<TABLES.WISHES>;
  editable?: boolean;
  onSubmit?: OnEditSubmit;
};

const WishDialog: FC<Props> = ({ data, editable, onSubmit }) => { ... };
export { WishDialog };
```

### Naming Conventions

- Components: PascalCase (`WishCard`, `FieldEditDialog`)
- Functions: camelCase (`createWish`, `updateWish`)
- Constants: UPPER_SNAKE_CASE (`TABLES`, `BLANK_WISHES`)
- Files: lowercase with hyphens or camelCase (e.g., `edit-dialog.tsx`, `field/index.tsx`)
- Directories: lowercase (e.g., `app/`, `ui/`)

### Error Handling

- Wrap async operations in try-catch blocks
- Add eslint-disable comments only when necessary with explanations
- Use optional chaining for potentially null/undefined values

Example:

```typescript
try {
  updateWish({ id, wished: true });
} catch (err) {
  // handle err
}
```

### React Best Practices

- We use React Compiler, so no need in useCallback, useMemo optimizations.
- Clean up side effects in useEffect cleanup functions
- Use `useLayoutEffect` for synchronous DOM updates
- Prefer controlled components over uncontrolled

Example:

```typescript
const onSubmit = () => {
  onEdit?.(field, edited);
  setOpen(false);
};

useEffect(() => {
  // effect logic
  return () => cleanup();
}, [dependencies]);
```

### Styling

- Use Tailwind CSS for styling
- Utility classes should be concise and use semantic color names
- Use `cn()` utility from `@/lib/utils` for merging classes
- Responsive design: mobile-first with `md:` breakpoints
- Use clsx + tailwind-merge via `cn()` for conditional classes

Example:

```typescript
className={cn(
  "flex flex-col gap-2 items-center",
  interactable ? "hover:border-violet-600" : ""
)}
```

### State Management

- Use Zustand for global state management
- Use React useState for local component state
- Keep state close to where it's used

### File Organization

- `/app` - main app page
- `/components` - Reusable UI components
  - `/ui` - Shadcn/ui components (low-level)
  - Feature-based subdirectories (e.g., `/wishlist`, `/timer`)
- `/hooks` - Custom React hooks
- `/lib` - Utility functions (e.g., `cn()`)
- `/types` - TypeScript type definitions

### TypeScript Configuration

- Strict mode enabled
- Target: ES2020
- JSX: react-jsx
- Path alias: `@/*` maps to `./src/*`
- Run type checking: `npx tsc --noEmit`

### TypeScript conventions

- Prefer explicit types at module boundaries (public functions, exported hooks).
- Avoid `any`; use `unknown` + narrowing when needed.
- Use `type` for object shapes and unions; `interface` not needed.
- Make `types.ts` files for each component, when we have more than 1 type.

### Additional Guidelines

- Use class-variance-authority (cva) for component variants (see button.tsx)
- Use Radix UI primitives for accessible components
- Use lucide-react for icons
- Follow existing patterns when adding new features
- Keep components under 150 lines when possible
- Extract types to separate `types.ts` files when reused
- create utils.ts file in component directive for external functions specifically used in component.
- when component has more than 3 constants - create constants.ts file and export constants variables from there.

### Commit Messages

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `chore:` etc.
- Keep messages concise (1-2 sentences)
- Focus on "why" not "what"

## React Query (TanStack Query)

We standardize query keys and query options to keep caching predictable and types consistent.

### Query keys: always centralize per domain

Create a `*QueryKeys` object with functions returning stable keys.

```ts
const usersQueryKeys = {
  get: () => ["getUsers"],
  delete: (id: string) => [`deleteUser-${id}`],
} as const;
```

### Query options

Define query options once and reuse them.

```ts
import { queryOptions } from "@tanstack/react-query";

const getUsers = (id: string) =>
  queryOptions({
    queryKey: usersQueryKeys.get(),
    queryFn: async () => {
      // API call
    },
  });
```

Use a mutation options factory and pass it to useMutation.

```ts
// options factory
const deleteUsers = (id: string) =>
  mutationOptions({
    mutationKey: usersQueryKeys.delete(id),
    mutationFn: async () => {
      // API call
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list(),
      });
    },
  });

// in component
const deleteUserMutation = useMutation(deleteUserMutationOptions("123"));
```

### Query file location

Create a `queries.ts` file in the component directory and export the query options from there.

### State management

We are using Zustand for state management. Create a `store.ts` file in the component directory and export the store from there.

- We use slice pattern for state management, like so:

```ts
import { create, StateCreator } from "zustand";

interface BearSlice {
  bears: number;
  addBear: () => void;
  eatFish: () => void;
}

interface FishSlice {
  fishes: number;
  addFish: () => void;
}

interface SharedSlice {
  addBoth: () => void;
  getBoth: () => number;
}

const createBearSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
});

const createFishSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
});

const createSharedSlice: StateCreator<
  BearSlice & FishSlice,
  [],
  [],
  SharedSlice
> = (set, get) => ({
  addBoth: () => {
    // you can reuse previous methods
    get().addBear();
    get().addFish();
    // or do them from scratch
    // set((state) => ({ bears: state.bears + 1, fishes: state.fishes + 1 })
  },
  getBoth: () => get().bears + get().fishes,
});

const useBoundStore = create<BearSlice & FishSlice & SharedSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
  ...createSharedSlice(...a),
}));
```

- If you have some middlewares then replace StateCreator<MyState, [], [], MySlice> with StateCreator<MyState, Mutators, [], MySlice>. For example, if you are using devtools then it will be StateCreator<MyState, [["zustand/devtools", never]], [], MySlice>. See the "Middlewares and their mutators reference" section for a list of all mutators.
