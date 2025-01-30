import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from '@/components/chat/message';
import { useScrollToBottom } from '@/components/chat/scroll-to-bottom';
import { memo } from 'react';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
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
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-3 md:gap-6 flex-1 px-0 py-4 md:py-6 scrollbar-thin scrollbar-thumb-secondary"
    >
      {/* {messages.length === 0 && <Overview />} */}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === 'user' && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  // Loading state changes
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  // Message length check (quick fail)
  if (prevProps.messages.length !== nextProps.messages.length) return false;

  // Only do shallow comparison of last message if lengths are same
  // This covers most common case of new messages being added
  const prevLastMsg = prevProps.messages[prevProps.messages.length - 1];
  const nextLastMsg = nextProps.messages[nextProps.messages.length - 1];
  if (prevLastMsg?.id !== nextLastMsg?.id || 
      prevLastMsg?.content !== nextLastMsg?.content ||
      prevLastMsg?.role !== nextLastMsg?.role) {
    return false;
  }

  return true;
});