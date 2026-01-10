import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { useEffect } from "react";

import { healthQueryOptions } from "@/app/queries";
import { Header } from "@/components/layout/header";
import { UploadPage } from "@/pages/upload";

const App: FC = () => {
  const { data, isLoading, isError } = useQuery(healthQueryOptions());
  const isHealthy = Boolean(data?.status) && !isLoading && !isError;

  useEffect(() => {
    if (isError) {
      alert("Mock server unavailable.");
    }
  }, [isError]);

  if (!isHealthy) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-4 xxl:px-64 md:px-12 md:py-6 lg:px-48">
      <div className="flex flex-col gap-6">
        <Header />
        <main>
          <UploadPage />
        </main>
      </div>
    </div>
  );
};

export { App };
