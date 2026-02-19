import type { FC } from "react";

import { FileUpload } from "@/components/file-upload";
import { ConversionSettings } from "@/components/settings/conversion-settings";
import { UPLOAD_CONTENT_MAX_WIDTH_CLASS } from "@/constants/layout";
import { cn } from "@/lib/utils";

type Props = Record<string, never>;

const UploadPage: FC<Props> = () => {
  return (
    <div
      className={cn(
        UPLOAD_CONTENT_MAX_WIDTH_CLASS,
        "flex w-full justify-center gap-4",
      )}
    >
      <section className="min-h-screen w-full 4xl:max-w-[960px]">
        <FileUpload />
      </section>

      <section className="hidden min-h-screen w-full xl:block xl:max-w-[432px]">
        <ConversionSettings className="min-h-[calc(100%-4rem)]" />;
      </section>
    </div>
  );
};

export { UploadPage };
