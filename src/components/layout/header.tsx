import { Logo } from "@/assets/logo";
import { UPLOAD_CONTENT_MAX_WIDTH_CLASS } from "@/constants/layout";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import type { FC } from "react";

type Props = {
  className?: string;
};

const Header: FC<Props> = ({ className }) => {
  return (
    <header
      className={cn(
        UPLOAD_CONTENT_MAX_WIDTH_CLASS,
        "relative flex h-16 items-center rounded-[10px] bg-gray-800 px-6",
        className,
      )}
    >
      <div className="absolute left-1/2 -translate-x-1/2 transform">
        <Logo className="h-8 w-auto text-white" />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <History className="text-white" />
        {/* <Avatar> */}
        {/*   <AvatarImage src="https://github.com/shadcn.png" /> */}
        {/*   <AvatarFallback>CN</AvatarFallback> */}
        {/* </Avatar> */}
      </div>
    </header>
  );
};

export { Header };
