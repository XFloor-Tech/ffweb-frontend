import type { FC } from "react";

import { UploadSettings } from "@/components/upload-settings";
import { FileUpload } from "./file-upload";

type Props = {};

const UploadPage: FC<Props> = () => {
  return (
    <div className="flex flex-col gap-4 text-white lg:flex-row">
      <section className="min-h-screen w-full lg:w-[960px] lg:shrink-0">
        <FileUpload />
      </section>

      <section className="hidden min-h-screen w-full lg:block">
        <UploadSettings />
      </section>
    </div>
  );
};

export { UploadPage };
