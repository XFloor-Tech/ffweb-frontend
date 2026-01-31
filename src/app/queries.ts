import { queryOptions } from "@tanstack/react-query";

import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";

const uploadQueryKeys = {
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
    queryKey: uploadQueryKeys.health(),
    queryFn: async () => {
      const [data, error] = await apiRequest<HealthResponse>({
        method: "GET",
        url: API_ENDPOINTS.health,
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
