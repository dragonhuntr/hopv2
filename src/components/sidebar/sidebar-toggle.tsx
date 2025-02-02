import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { SidebarLeftIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SidebarToggle({
  className,
  inSidebar,
}: ComponentProps<typeof SidebarTrigger> & { inSidebar?: boolean }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant={inSidebar ? "ghost" : "outline"}
          className={cn(
            "md:px-2 md:h-fit",
            inSidebar && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            className
          )}
        >
          <SidebarLeftIcon size={16} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
