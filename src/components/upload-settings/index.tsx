import type { FC } from "react";
import { ConversionSettings } from "../settings/conversion-settings";

type Props = {};

const UploadSettings: FC<Props> = () => {
  return (
    <div className="h-full max-h-[calc(100%-4rem)] w-full overflow-auto rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-gray-50">
      <ConversionSettings className="max-h-[calc(100%-4rem)]" />
    </div>
  );
};

export { UploadSettings };
