import { Settings } from "lucide-react";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UploadSettings } from "@/components/upload-settings";
import { FileUpload } from "./file-upload";

type Props = {};

const UploadPage: FC<Props> = () => {
  return (
    <div className="flex gap-4">
      <section className="min-h-screen w-full 4xl:max-w-[960px]">
        <FileUpload />
      </section>
      <section className="hidden min-h-screen w-full xl:block xl:max-w-[432px]">
        <UploadSettings />
      </section>

      <div className="w-14 rounded-xl border border-gray-800 bg-gray-900/40 p-2 xl:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button aria-label="Open settings" size="icon" variant="ghost">
              <Settings className="size-5 text-gray-50" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[calc(100%-2rem)] p-0 sm:max-w-[calc(100%-4rem)]">
            <UploadSettings />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export { UploadPage };
