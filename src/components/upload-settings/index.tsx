import type { FC } from "react";
import { ConversionSettings } from "../settings/conversion-settings";

type Props = {};

const UploadSettings: FC<Props> = () => {
  return <ConversionSettings className="max-h-[calc(100%-4rem)]" />;
};

export { UploadSettings };
