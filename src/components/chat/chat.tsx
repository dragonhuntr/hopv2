'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { ChatHeader } from '@/components/chat/chat-header';

const DynamicMultimodalInput = dynamic(() => import('@/components/chat/multimodal-input').then(mod => mod.MultimodalInput), {
  ssr: false
});

const DynamicMessages = dynamic(() => import('@/components/chat/messages').then(mod => mod.Messages), {
  ssr: false
});

import { VisibilityType } from '@/components/chat/visibility-selector';

export const Chat = memo(function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, modelId: currentModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      // Only revalidate once the message is fully complete
      mutate('/api/history');
      window.dispatchEvent(new Event('message-sent'));
    },
    onResponse: () => {
      // Remove event dispatch from onResponse since we only need it once at completion
      mutate('/api/history');
    }
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={currentModelId}
          onModelChange={setCurrentModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <DynamicMessages
          chatId={id}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <DynamicMultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
            />
          )}
        </form>
      </div>
    </>
  );
});
