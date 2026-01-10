import type { FC } from "react";

import { UploadSettings } from "@/components/upload-settings";
import { FileUpload } from "./file-upload";

type Props = {};

const UploadPage: FC<Props> = () => {
  return (
    <div className="grid gap-4 text-white xxl:grid-cols-[minmax(0,960px)_minmax(0,1fr)]">
      <section className="min-h-screen w-full xxl:max-w-[960px]">
        <FileUpload />
      </section>

      <section className="hidden min-h-screen w-full xxl:block">
        <UploadSettings />
      </section>
    </div>
  );
};

export { UploadPage };
