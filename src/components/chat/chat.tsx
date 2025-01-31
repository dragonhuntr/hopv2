'use client';

import type { Attachment, Message, ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import { useState, useCallback, useMemo, useRef, type SetStateAction, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { ChatHeader } from '@/components/chat/chat-header';
import type { Model } from '@/types/model';
import { models } from '@/lib/ai/models';

// Preload dynamic components
const MultimodalInputPromise = () => import('./multimodal-input').then(mod => mod.MultimodalInput);
const MessagesPromise = () => import('./messages').then(mod => mod.Messages);

// Dynamically import heavy components with loading state
const DynamicMultimodalInput = dynamic(MultimodalInputPromise, {
  ssr: false,
  loading: () => <div className="h-[50px] w-full bg-muted animate-pulse rounded-lg" />
});

const DynamicMessages = dynamic(MessagesPromise, {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
});

// Preload components on mount
const preloadComponents = () => {
  MultimodalInputPromise();
  MessagesPromise();
};

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
  const router = useRouter();
  const pathname = usePathname();
  // Preload components on mount
  useEffect(() => {
    preloadComponents();
  }, []);

  const { mutate } = useSWRConfig();
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  
  // Use refs for event handlers and stable values
  const messageEventRef = useRef(() => {
    window.dispatchEvent(new Event('message-sent'));
  });
  
  const mutateRef = useRef(mutate);
  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);
  
  // Memoize the mutate callback
  const handleMutate = useCallback(() => {
    mutateRef.current('/api/history');
  }, []);

  // Memoize model change handler
  const handleModelChange = useCallback((modelId: string) => {
    setCurrentModelId(modelId);
  }, []);

  const chatConfig = useMemo(() => ({
    id,
    body: { id, modelId: currentModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      handleMutate();
      messageEventRef.current();
    },
    onResponse: () => {
      handleMutate();
      if (pathname === '/chat') {
        history.replaceState({}, '', `/chat/${id}`);
      }
    }
  }), [id, currentModelId, initialMessages, handleMutate, pathname]);

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

  // Memoize handlers
  const handleSetInput = useCallback((value: string) => {
    setInput(value);
  }, [setInput]);

  const handleSetMessages = useCallback((value: SetStateAction<Message[]>) => {
    setMessages(value);
  }, [setMessages]);

  const handleSetAttachments = useCallback((value: SetStateAction<Attachment[]>) => {
    setAttachments(value);
  }, []);

  // Get model vision capability
  const isVisionModel = useMemo(() => {
    const model = models.find(m => m.id === currentModelId);
    return model?.vision ?? false;
  }, [currentModelId]);

  // Memoize props passed to child components
  const headerProps = useMemo(() => ({
    chatId: id,
    selectedModelId: currentModelId,
    onModelChange: handleModelChange,
    selectedVisibilityType,
    isReadonly
  }), [id, currentModelId, handleModelChange, selectedVisibilityType, isReadonly]);

  const messagesProps = useMemo(() => ({
    chatId: id,
    isLoading,
    messages,
    setMessages: handleSetMessages,
    reload,
    isReadonly,
  }), [id, isLoading, messages, handleSetMessages, reload, isReadonly]);

  const multimodalInputProps = useMemo(() => ({
    chatId: id,
    input,
    setInput: handleSetInput,
    handleSubmit,
    isLoading,
    stop,
    attachments,
    setAttachments: handleSetAttachments,
    messages,
    setMessages: handleSetMessages,
    append,
    isVisionModel
  }), [id, input, handleSetInput, handleSubmit, isLoading, stop, attachments, handleSetAttachments, messages, handleSetMessages, append, isVisionModel]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader {...headerProps} />
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto px-4 md:px-8">
            <DynamicMessages {...messagesProps} />
          </div>
        </div>
        <div className="w-full max-w-3xl mx-auto px-4 md:px-8 pb-4 md:pb-8">
          {!isReadonly && (
            <DynamicMultimodalInput {...multimodalInputProps} />
          )}
        </div>
      </div>
    </>
  );
});
