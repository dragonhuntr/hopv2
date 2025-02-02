'use client';

import { useChat } from 'ai/react';
import dynamic from 'next/dynamic';
import type { Message, VisibilityType } from '@/types/chat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatErrorBoundary } from '@/components/chat/error-boundary';
import { useChatConfig } from '@/hooks/use-chat-config';
import { useChatPersistence } from '@/hooks/use-chat-persistence';

// Optimize dynamic imports with explicit chunks
const MultimodalInput = dynamic(
  () => import('./multimodal-input').then(mod => mod.MultimodalInput),
  {
    ssr: false,
    loading: () => <div className="h-[50px] w-full bg-muted animate-pulse rounded-lg" />
  }
);

const Messages = dynamic(
  () => import('./messages').then(mod => mod.Messages),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
);

interface ChatProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: ChatProps) {
  // Use custom hooks for chat configuration and state
  const {
    currentModelId,
    attachments,
    setAttachments,
    chatConfig,
    handleModelChange,
    isVisionModel,
  } = useChatConfig({
    id,
    initialMessages: initialMessages.map(msg => ({ ...msg, createdAt: msg.createdAt || new Date() })),
    selectedModelId,
    selectedVisibilityType,
  });

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
  } = useChat(chatConfig);

  // Use persistence hook
  useChatPersistence({
    chatId: id,
    messages: messages.map(msg => ({ ...msg, createdAt: msg.createdAt || new Date() })),
    setMessages: messages => setMessages(
      typeof messages === 'function'
        ? prev => messages(prev.map(msg => ({ ...msg, createdAt: msg.createdAt || new Date() })))
        : messages.map(msg => ({ ...msg, createdAt: msg.createdAt || new Date() }))
    ),
  });

  // Props for child components
  const headerProps = {
    chatId: id,
    selectedModelId: currentModelId,
    onModelChange: handleModelChange,
    selectedVisibilityType,
    isReadonly
  };

  const messagesProps = {
    chatId: id,
    isLoading,
    messages,
    setMessages,
    reload,
    isReadonly,
  };

  const inputProps = {
    chatId: id,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    attachments,
    setAttachments,
    messages,
    setMessages,
    append,
    isVisionModel
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background md:w-[calc(100%-16rem)] md:max-w-[calc(100%-16rem)] lg:max-w-[calc(100%-16rem)] xl:max-w-[calc(100%-16rem)]">
      <ChatHeader {...headerProps} />
      <ChatErrorBoundary>
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="w-full mx-auto px-4 md:px-8 min-w-0">
            <Messages {...messagesProps} />
          </div>
        </div>
        <div className="w-full mx-auto px-4 md:px-8 pb-4 md:pb-8">
          {!isReadonly && (
            <MultimodalInput {...inputProps} />
          )}
        </div>
      </ChatErrorBoundary>
    </div>
  );
}
