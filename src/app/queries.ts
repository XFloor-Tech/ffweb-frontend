import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";

const appQueryKeys = {
  health: () => ["health"],
} as const;

type HealthResponse = {
  status: string;
  timestamp: string;
  stats: {
    active_tasks: number;
    chunked_uploads: number;
  };
};

const healthQueryOptions = () =>
  queryOptions({
    queryKey: appQueryKeys.health(),
    queryFn: async () => {
      const [data, error] = await apiRequest<HealthResponse>({
        method: "GET",
        url: "/health",
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Missing health response data");
      }

      return data;
    },
  });

export { healthQueryOptions };
