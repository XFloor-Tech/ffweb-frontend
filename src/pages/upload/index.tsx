import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";

import { healthQueryOptions } from "./queries";

type Props = {};

const UploadPage: FC<Props> = () => {
  const { data, isLoading, isError } = useQuery(healthQueryOptions());

  if (isLoading) {
    return <div className="text-white">Loading mock server...</div>;
  }

  if (isError) {
    return <div className="text-red-400">Mock server unavailable.</div>;
  }

  return (
    <div className="text-white">
      Mock server status: {data?.status ?? "unknown"}
    </div>
  );
};

export { UploadPage };
