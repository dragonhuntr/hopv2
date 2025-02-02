import type { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from '@/components/chat/message';
import { useScrollToBottom } from '@/components/chat/scroll-to-bottom';
import { memo, useCallback } from 'react';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  messages: Message[];
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  isLoading,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  // Memoize message update handler
  const handleSetMessages = useCallback(
    (updater: Message[] | ((messages: Message[]) => Message[])) => {
      setMessages(updater);
    },
    [setMessages]
  );

  const isThinking = isLoading && 
    messages.length > 0 && 
    messages[messages.length - 1]?.role === 'user';

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-3 md:gap-6 flex-1 px-0 py-4 md:py-6 scrollbar-thin scrollbar-thumb-secondary"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && index === messages.length - 1}
          setMessages={handleSetMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isThinking && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

// Optimized memo comparison
export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (
    prevProps.isLoading !== nextProps.isLoading ||
    prevProps.messages.length !== nextProps.messages.length ||
    prevProps.chatId !== nextProps.chatId ||
    prevProps.isReadonly !== nextProps.isReadonly
  ) {
    return false;
  }

  // Deep compare messages only if other props are equal
  return prevProps.messages.every((msg, i) => {
    const nextMsg = nextProps.messages[i];
    if (!nextMsg) return false;
    
    return (
      msg.id === nextMsg.id &&
      msg.content === nextMsg.content &&
      msg.role === nextMsg.role
    );
  });
});