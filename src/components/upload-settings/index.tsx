import type { FC } from "react";
import { ConversionSettings } from "../settings/conversion-settings";


type Props = {};

const UploadSettings: FC<Props> = () => {
  return (
    <div className="h-full w-full rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-gray-50">
      <ConversionSettings />
    </div>
  );
};

export { UploadSettings };
