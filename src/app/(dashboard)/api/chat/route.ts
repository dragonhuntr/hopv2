import {
    type Message,
    convertToCoreMessages,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from 'ai';

import {
    deleteChatById,
    getChatById,
    saveChat,
    saveMessages,
    deleteAllChatsByUserId,
} from '@/prisma/queries';

import { auth } from '@/lib/auth';
import { customModel } from '@/lib/ai';
import { models, DEFAULT_MODEL_ID, DEFAULT_TITLE_MODEL_ID } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { generateTitleFromUserMessage } from '@/app/(dashboard)/actions';

export const maxDuration = 60;

export async function POST(request: Request) {
    const {
        id,
        messages,
        modelId = DEFAULT_MODEL_ID,
    }: { 
        id: string, 
        messages: Array<Message & { attachments?: Array<{ url: string; name: string; contentType: string; }> }>;
        modelId: string 
    } = await request.json();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json('Unauthorized!', { status: 401 });
    }

    const model = models.find((model) => model.id === modelId);

    if (!model) {
        return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
        return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
        const title = await generateTitleFromUserMessage({ message: userMessage, model: DEFAULT_TITLE_MODEL_ID });
        await saveChat({ id, userId: session.user.id, title, model: model.apiIdentifier });
    }

    const userMessageId = generateUUID();
    const lastMessage = messages[messages.length - 1];

    await saveMessages({
        messages: [
            { 
                ...userMessage, 
                id: userMessageId, 
                createdAt: new Date(), 
                chatId: id,
                content: userMessage.content as string,
                attachments: lastMessage?.experimental_attachments?.map((attachment) => ({
                    ...attachment,
                }))
            },
        ],
    });

    return createDataStreamResponse({
        execute: async (dataStream) => {

            const result = streamText({
                model: customModel(model.apiIdentifier),
                system: systemPrompt,
                messages: coreMessages,
                experimental_transform: smoothStream(), 
                maxSteps: 5,
                onFinish: async ({ response }) => {
                  if (session.user?.id) {
                    try {

                      await saveMessages({
                        messages: response.messages.map(
                          (message) => {
                            const messageId = generateUUID();

                            return {
                              id: messageId,
                              chatId: id,
                              role: message.role,
                              content: message.content as string,
                              createdAt: new Date(),
                            };
                          },
                        ),
                      });
                    } catch (error) {
                      console.error('Failed to save chat');
                    }
                  }
                },
            });

            result.mergeIntoDataStream(dataStream);
        },
    });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');
  
    const session = await auth.api.getSession({
      headers: request.headers,
    });
  
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    try {
      if (deleteAll === 'true') {
        await deleteAllChatsByUserId({ userId: session.user.id });
        return new Response('All chats deleted', { status: 200 });
      }
  
      if (!id) {
        return new Response('Not Found', { status: 404 });
      }
  
      const chat = await getChatById({ id });
  
      if (chat?.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
  
      await deleteChatById({ id });
      return new Response('Chat deleted', { status: 200 });
    } catch (error) {
      return new Response('An error occurred while processing your request', {
        status: 500,
      });
    }
  }
  