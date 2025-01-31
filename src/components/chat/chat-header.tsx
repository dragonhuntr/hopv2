'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { useSWRConfig } from 'swr';

import { SidebarToggle } from '@/components/chat/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VisibilityType } from '@/components/chat/visibility-selector';

const DynamicModelSelector = dynamic(() => import('@/components/chat/model-selector').then(mod => mod.ModelSelector), {
  ssr: false
});

const DynamicVisibilitySelector = dynamic(() => import('@/components/chat/visibility-selector').then(mod => mod.VisibilitySelector), {
  ssr: false
});

function PureChatHeader({
  chatId,
  selectedModelId,
  onModelChange,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { mutate } = useSWRConfig();

  const handleNewChat = () => {
    router.push('/');
  };

  const newChatButton = useMemo(() => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="px-2 h-8"
          onClick={handleNewChat}
        >
          <PlusIcon size={16} />
          <span className="hidden md:inline-block ml-2">New Chat</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>New Chat</TooltipContent>
    </Tooltip>
  ), [router]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 flex-1">
            {(!open || windowWidth < 768) && <SidebarToggle />}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/chat')}
            >
              <h1 className="text-lg font-semibold text-foreground">HopV2</h1>
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {newChatButton}
            {!isReadonly && (
              <>
                <DynamicModelSelector
                  selectedModelId={selectedModelId}
                  onModelChange={onModelChange}
                  chatId={chatId}
                />
                <DynamicVisibilitySelector
                  selectedVisibilityType={selectedVisibilityType}
                  chatId={chatId}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prev, next) => {
  return prev.chatId === next.chatId &&
         prev.selectedModelId === next.selectedModelId &&
         prev.selectedVisibilityType === next.selectedVisibilityType &&
         prev.isReadonly === next.isReadonly;
});
