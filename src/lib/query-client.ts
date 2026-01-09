import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce “immediately stale” refetch churn for most UIs
      staleTime: 60_000, // 60s (bump to 1–5 min for mostly-read UIs)
      // Keep caches around a bit longer to make navigation snappy
      gcTime: 10 * 60 * 1000, // 10 min (v5 name; used to be cacheTime)
      // Avoid surprising refetches when tabbing around
      refetchOnWindowFocus: false,
      // Keep reconnect behavior (usually good), but optional
      refetchOnReconnect: true,
      // Retries: good for flaky networks, but don’t DDOS your API
      retry: (failureCount, error) => {
        // don’t retry 4xx statuses
        const status =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- status should be there
          (error as any)?.status ?? (error as any)?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2; // 2 retries
      },
    },
    mutations: {
      retry: 0, // mutations often shouldn’t auto-retry unless you’ve designed for it
    },
  },
});

export { queryClient };
