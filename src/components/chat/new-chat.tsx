'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function NewChat({
  className,
  inSidebar,
}: {
  className?: string;
  inSidebar?: boolean;
}) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={inSidebar ? "ghost" : "outline"}
          className={cn(
            "px-2 h-8",
            inSidebar && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-6 justify-start",
            className
          )}
          onClick={handleNewChat}
        >
          <PlusIcon size={16} />
        </Button>
      </TooltipTrigger>
    </Tooltip>
  );
} 