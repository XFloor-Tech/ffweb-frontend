import { FileAudio, Scissors, Settings2, Sliders } from "lucide-react";
import type { FC } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card
      className={cn(
        "mx-auto h-full w-full max-w-4xl border-gray-950 bg-gray-900 text-white",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/20 p-2">
              <Settings2 className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <CardTitle className="text-white">Conversion Settings</CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-700 text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800 hover:text-white active:bg-gray-900"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator className="bg-gray-800" />

      <CardContent className="pt-6">
        <Accordion
          type="multiple"
          defaultValue={DEFAULT_ACCORDION_VALUE}
          className="w-full space-y-4"
        >
          {/* Basic Settings Accordion Item */}
          <AccordionItem
            value={accordionValues.BASIC}
            className="rounded-lg border border-gray-800 bg-gray-900"
          >
            <AccordionTrigger className="rounded-t-lg px-4 py-4 hover:bg-gray-800/50 hover:no-underline">
              <div className="flex w-full items-center gap-3 text-left">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-600/20 p-2">
                      <FileAudio className="h-4 w-4 text-blue-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">Codec</h3>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pt-2 pb-6">
              <Separator className="mb-6 bg-gray-800" />
              <BasicSettings />
            </AccordionContent>
          </AccordionItem>

          {/* Advanced Settings Accordion Item */}
          <AccordionItem
            value={accordionValues.ADVANCED}
            className="rounded-lg border border-gray-800 bg-gray-900"
          >
            <AccordionTrigger className="rounded-t-lg px-4 py-4 hover:bg-gray-800/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-purple-600/20 p-2">
                  <Sliders className="h-4 w-4 text-purple-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Advanced Audio Settings
                  </h3>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pt-2 pb-6">
              <Separator className="mb-6 bg-gray-800" />
              <AdvancedSettings />
            </AccordionContent>
          </AccordionItem>

          {/* Trimming Settings Accordion Item */}
          <AccordionItem
            value={accordionValues.TRIMMING}
            className="rounded-lg border border-gray-800 bg-gray-900"
          >
            <AccordionTrigger className="rounded-t-lg px-4 py-4 hover:bg-gray-800/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-amber-600/20 p-2">
                  <Scissors className="h-4 w-4 text-amber-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Editing / Trimming
                  </h3>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pt-2 pb-6">
              <Separator className="mb-6 bg-gray-800" />
              <TrimmingSettings />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
export { ConversionSettings };
