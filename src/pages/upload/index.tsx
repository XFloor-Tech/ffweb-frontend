import type { FC } from "react";

import { UploadSettings } from "@/components/upload-settings";
import { FileUpload } from "./file-upload";

type Props = Record<string, never>;

const UploadPage: FC<Props> = () => {
  return (
    <div className="flex gap-4">
      <section className="min-h-screen w-full 4xl:max-w-[960px]">
        <FileUpload />
      </section>

      <section className="hidden min-h-screen w-full xl:block xl:max-w-[432px]">
        <UploadSettings />
      </section>
    </div>
  );
};

export { UploadPage };
