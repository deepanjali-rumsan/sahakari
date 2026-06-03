import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

import { configureSDK } from "@rs/sdk";

import "../styles.css";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
configureSDK({ apiUrl });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-headline text-on-surface text-2xl font-semibold">
        Page not found
      </h1>
      <p className="text-on-surface-variant text-sm">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="text-primary text-sm font-medium underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
