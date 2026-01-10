import type { FC } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Header: FC<Props> = ({ className }) => {
  return (
    <header
      className={cn("h-16 w-full rounded-[10px] bg-gray-800", className)}
    />
  );
};

export { Header };
