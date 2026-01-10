import type { FC } from "react";
import { Header } from "@/components/layout/header";
import { UploadPage } from "@/pages/upload";
import { Providers } from "@/app/providers";

const App: FC = () => {
  return (
    <Providers>
      <div className="min-h-screen px-64 py-6">
        <div className="flex flex-col gap-6">
          <Header />
          <main>
            <UploadPage />
          </main>
        </div>
      </div>
    </Providers>
  );
};

export { App };
