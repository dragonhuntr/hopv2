import { useEffect, useCallback } from 'react';
import type { Message } from '@/types/chat';

const STORAGE_KEY_PREFIX = 'chat_backup_';

interface UseChatPersistenceProps {
  chatId: string;
  messages: Message[];
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
}

/**
 * Custom hook to handle message persistence with local storage backup
 * Automatically saves messages and restores them if needed
 */
export function useChatPersistence({
  chatId,
  messages,
  setMessages,
}: UseChatPersistenceProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}${chatId}`;

  // Load messages from local storage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages && messages.length === 0) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to restore messages:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, messages.length, setMessages]);

  // Save messages to local storage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Clear backup when needed
  const clearBackup = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { clearBackup };
} 