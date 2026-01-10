import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { healthQueryOptions } from "@/app/queries";
import { Header } from "@/components/layout/header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { UploadPage } from "@/pages/upload";

const App: FC = () => {
  const { data, isLoading, isError } = useQuery(healthQueryOptions());

  const isHealthy = Boolean(data?.status) && !isLoading && !isError;
  const hasShownError = useRef(false);

  useEffect(() => {
    if (isError && !hasShownError.current) {
      toast.error("Mock server unavailable.");
      hasShownError.current = true;
    }

    if (!isError) {
      hasShownError.current = false;
    }
  }, [isError]);

  if (isLoading) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen px-4 py-4 2xl:px-64 md:px-12 md:py-6 lg:px-48">
          <Spinner className="text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen px-4 py-4 2xl:px-64 md:px-12 md:py-6 lg:px-48">
        <div className="flex flex-col gap-6">
          <Header />
          <main>
            {!isHealthy && (
              <Alert variant="destructive">
                <AlertTitle>We couldn't reach the server</AlertTitle>
                <AlertDescription>
                  Please start the mock server and reload the page.
                </AlertDescription>
              </Alert>
            )}

            {isHealthy && <UploadPage />}
          </main>
        </div>
      </div>
    </>
  );
};

export { App };
