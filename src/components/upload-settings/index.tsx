import type { FC } from "react";
import { ConversionSettings } from "../settings/conversion-settings";

type Props = {
  className?: string;
};

const UploadSettings: FC<Props> = ({ className }) => {
  return (
    <div>
      <ConversionSettings />
    </div>
  );
};

export { UploadSettings };
