"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import { useState } from "react";

/**
 * Server-state cache for the whole app.
 *
 * The client is created inside useState rather than at module scope: a
 * module-level client is shared across every request on the server, which
 * would leak one user's cached data into another's render.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Navigating between routes re-mounts components. Without a
            // staleTime every such mount refires the request, so moving
            // between the registry and a passport page refetched constantly.
            // Five minutes is long enough that ordinary navigation is
            // instant, short enough that a stale list is not left on screen.
            staleTime: 5 * 60 * 1000,

            // Keep unmounted data around so going back to a list is instant.
            gcTime: 30 * 60 * 1000,

            // Alt-tabbing is not a reason to refetch.
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,

            retry: (failureCount, error) => {
              // A 401/403/404 will not become a different answer by asking
              // again — retrying only delays the error the user needs to see.
              if (isAxiosError(error)) {
                const status = error.response?.status;

                if (status && status >= 400 && status < 500) return false;
              }

              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
