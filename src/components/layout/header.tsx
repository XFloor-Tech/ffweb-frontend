import type { FC } from "react";
import { cn } from "@/lib/utils";
import { History } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/assets/logo";


type Props = {
  className?: string;
};

const Header: FC<Props> = ({ className }) => {
  return (
    <header
      className={cn("h-16 w-full rounded-[10px] bg-gray-800",
        "flex items-center relative px-6", className)}
    >
  <div className="absolute left-1/2 transform -translate-x-1/2">
        <Logo className="h-8 w-auto text-white" />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <History className="text-white" />
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      </header>
  );
};

export { Header };
