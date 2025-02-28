'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { memo, useState, useEffect } from 'react';

import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';
import { NewChat } from '@/components/chat/new-chat';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { VisibilityType } from '@/components/chat/visibility-selector';

const DynamicModelSelector = dynamic(() => import('@/components/chat/model-selector').then(mod => mod.ModelSelector), {
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
  const { width: windowWidth = 0 } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 flex-1">
            {isMounted && (!open || windowWidth < 768) && (
              <SidebarToggle />
            )}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/chat')}
            >
              <span className="text-lg font-semibold text-foreground">HopV2</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {chatId && !isReadonly && (
              <DynamicModelSelector
                selectedModelId={selectedModelId}
                onModelChange={onModelChange}
                chatId={chatId}
              />
            )}
            <NewChat />
          </div>
        </div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
