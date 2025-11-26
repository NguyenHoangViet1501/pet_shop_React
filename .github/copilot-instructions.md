# Copilot Instructions for AI Agents

## Project Overview

- This is a React-based pet shop web app with modular structure under `src/`.
- Data fetching is handled via TanStack Query (`@tanstack/react-query`) for client-side caching and state management.
- API calls are abstracted in `src/api/` and accessed via custom hooks in `src/hooks/`.

## Key Architectural Patterns

- **Query Client Provider**: The app is wrapped in `QueryClientProvider` in `src/index.js` with custom caching defaults (see file for details).
- **Custom Query Hooks**: Use hooks like `useProductsQuery` and `useCategoriesQuery` (in `src/hooks/`) for all data fetching. Do not call API modules directly in components.
- **Component Structure**: Pages in `src/pages/`, reusable UI in `src/components/`, context providers in `src/context/`.
- **API Layer**: All API endpoints are defined in `src/api/` (e.g., `products.js`, `categories.js`).
- **Global Styles**: Use `src/styles/global.css` for app-wide CSS.

## Data Fetching & Caching

- Always use the custom hooks for fetching and caching data. Example:
  ```js
  const { data, isLoading, isError } = useProductsQuery({
    pageNumber,
    size,
    ...filters,
  });
  ```
- Query keys are structured as arrays: e.g., `['products', params]`.
- Caching, stale time, and retry logic are set globally in `src/index.js`.

## Error & Loading Handling

- Use `isLoading` and `isError` from query hooks to show loading spinners or error messages in UI.
- See `ProductsPage.jsx` for a full example of query-driven UI state.

## Adding New Data Fetching

1. Add API logic in `src/api/`.
2. Create a custom hook in `src/hooks/` using `useQuery`.
3. Use the hook in your component/page.

## Example Files

- `src/pages/ProductsPage.jsx`: Example of full TanStack Query integration.
- `src/hooks/useProductsQuery.js`, `src/hooks/useCategoriesQuery.js`: Custom query hooks.
- `src/index.js`: QueryClientProvider setup and global config.

## Conventions

- Do not use `useEffect` for API calls; always use query hooks.
- Keep all API URLs and logic in `src/api/`.
- Use context providers for cross-cutting concerns (auth, cart, toast, etc.).

---

For more, see TanStack Query docs: https://tanstack.com/query/latest
