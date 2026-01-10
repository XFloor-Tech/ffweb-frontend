import type { FC } from "react";

import { UploadSettings } from "@/components/upload-settings";
import { FileUpload } from "./file-upload";

type Props = {};

const UploadPage: FC<Props> = () => {
  return (
    <div className="flex gap-4 text-white">
      <section className="min-h-screen w-[960px] shrink-0">
        <FileUpload />
      </section>

      <section className="min-h-screen w-full">
        <UploadSettings />
      </section>
    </div>
  );
};

export { UploadPage };
