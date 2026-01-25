import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileAudio,
  RotateCcw,
  Scissors,
  Settings2,
  Sliders,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useConversionStore } from "@/stores/conversionStore";
import { AdvancedSettings } from "./advanced-settings";
import { BasicSettings } from "./basic-settings";
import { TrimmingSettings } from "./trimming-settings";

type Props = {
  className?: string;
};

export function ConversionSettings({ className }: Props) {
  const { resetToDefaults } = useConversionStore();

  return (
    <Card className={cn("mx-auto w-full max-w-4xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Audio Conversion Settings</CardTitle>
              <CardDescription>
                Configure all conversion options in one place
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <Accordion
          type="multiple"
          defaultValue={["basic", "advanced", "trimming", "command"]}
          className="w-full space-y-2"
        >
          {/* Basic Settings Accordion Item */}
          <AccordionItem value="basic" className="rounded-lg border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <FileAudio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Basic Audio Settings</h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <Separator className="mb-6" />
              <BasicSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="advanced" className="rounded-lg border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Audio Processing</h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <Separator className="mb-6" />
              <AdvancedSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="trimming" className="rounded-lg border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                  <Scissors className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Editing & Trimming</h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <Separator className="mb-6" />
              <TrimmingSettings />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Configuration</h4>
              <p className="text-sm text-muted-foreground">
                All settings are applied immediately
              </p>
            </div>
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

