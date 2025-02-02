import type { Message as AIMessage } from 'ai';

/** 
 * Re-export the AI SDK's Message type to ensure compatibility
 */
export type Message = AIMessage;

/** 
 * Represents a chat conversation between a user and the AI assistant.
 * Each chat can have multiple messages and specific visibility settings.
 */
export interface Chat {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  visibility: 'private' | 'public';
  modelId: string;
  userId: string;
}

/** Valid visibility settings for a chat */
export type VisibilityType = Chat['visibility'];

export interface ChatState {
  chat: Chat | null;
  isLoading: boolean;
  error: Error | null;
}
