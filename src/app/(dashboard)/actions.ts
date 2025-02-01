'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { customModel } from '@/lib/ai';
import { titlePrompt } from '@/lib/ai/prompts';
import { 
  getChatById, 
  getMessageById, 
  updateChatModelById,
  deleteMessagesByChatIdAfterTimestamp,
  updateChatVisibilityById
} from '@/prisma/queries';

export async function generateTitleFromUserMessage({
    message,
    model,
  }: {
    message: CoreUserMessage;
    model: string;
  }) {
    const { text: title } = await generateText({
      model: customModel(model),
      system: titlePrompt(message),
      prompt: JSON.stringify(message),
    });
  
    return title;
  }

  export async function deleteTrailingMessages({ id }: { id: string }) {
    const message = await getMessageById({ id });
  
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }
  
    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  }

  export async function saveModelId(chatId: string, model: string) {
    const chat = await getChatById({ id: chatId });
    
    // Only update if chat exists
    if (chat) {
      await updateChatModelById({ chatId, model });
      // Remove revalidation since we're handling state client-side
    }
  }
  export async function updateChatVisibility({
    chatId,
    visibility,
  }: {
    chatId: string;
    visibility: 'private' | 'public';
  }) {
    const chat = await getChatById({ id: chatId });
    
    // Only update if chat exists
    if (chat) {
      await updateChatVisibilityById({ chatId, visibility });
    }
  }
