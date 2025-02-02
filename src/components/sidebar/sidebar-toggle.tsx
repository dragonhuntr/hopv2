'use client';

import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Dynamically import the icon to avoid hydration mismatch
const DynamicSidebarLeftIcon = dynamic(
  () => import('@/components/ui/icons').then((mod) => mod.SidebarLeftIcon),
  { ssr: false }
);

export function SidebarToggle({
  className,
  inSidebar,
}: ComponentProps<typeof SidebarTrigger> & { inSidebar?: boolean }) {
  const { toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button
        onClick={toggleSidebar}
        variant={inSidebar ? "ghost" : "outline"}
        className={cn(
          "md:px-2 md:h-fit",
          inSidebar && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className
        )}
      >
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  }

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
          <DynamicSidebarLeftIcon size={16} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
