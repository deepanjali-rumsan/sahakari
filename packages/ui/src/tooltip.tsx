"use client";

import * as React from "react";
import {
  Content,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className = "", sideOffset = 4, ...props }, ref) => (
  <Content
    ref={ref}
    sideOffset={sideOffset}
    className={
      "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 " +
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 " +
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 " +
      "z-50 mb-2 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md " +
      className
    }
    {...props}
  />
));

TooltipContent.displayName = Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
