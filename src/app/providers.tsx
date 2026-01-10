import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Providers: FC<Props> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    {children}
  </QueryClientProvider>
);

export { Providers };
