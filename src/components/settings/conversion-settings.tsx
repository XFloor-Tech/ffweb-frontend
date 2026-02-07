import { Scissors, Settings2, Sliders } from "lucide-react";
import type { FC } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useConversionStore } from "@/store/conversion-store";
import { AdvancedSettings } from "./advanced-settings";
import { BasicSettings } from "./basic-settings";
import { TrimmingSettings } from "./trimming-settings";

type Props = {
  className?: string;
};

// https://www.totaltypescript.com/erasable-syntax-only#what-does-erasablesyntaxonly-do
// Enums are not being used here because we have erasableSyntaxOnly=true in our tsconfig file.
// This means that the enum values are not being erased during compilation, which is bad for bundlers.
// So it's better to use a const object instead of enums!!!
const accordionValues = {
  BASIC: "basic",
  ADVANCED: "advanced",
  TRIMMING: "trimming",
} as const;

type AccordionValue = (typeof accordionValues)[keyof typeof accordionValues];

const DEFAULT_ACCORDION_VALUE: AccordionValue[] = [accordionValues.BASIC];

const ConversionSettings: FC<Props> = ({ className }) => {
  const { resetToDefaults } = useConversionStore();

  return (
    <div
      className={cn(
        "flex h-full w-full max-w-4xl flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900 p-6 text-white",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600/20 p-2">
            <Settings2 className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <span className="text-h4">Conversion Settings</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-700 text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800 hover:text-white active:bg-gray-900"
          >
            Reset
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      <BasicSettings />

      <Accordion
        type="multiple"
        defaultValue={DEFAULT_ACCORDION_VALUE}
        className="flex w-full flex-col gap-6"
      >
        <AccordionItem value={accordionValues.ADVANCED}>
          <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
              <div className="rounded-lg bg-purple-600/20 p-2">
                <Sliders className="h-4 w-4 text-purple-400" />
              </div>

              <span className="text-small">Advanced Audio Settings</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="mt-2">
            <AdvancedSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value={accordionValues.TRIMMING}>
          <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
              <div className="rounded-lg bg-amber-600/20 p-2">
                <Scissors className="h-4 w-4 text-amber-400" />
              </div>

              <span className="text-small">Editing / Trimming</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="mt-2">
            <TrimmingSettings />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
export { ConversionSettings };
