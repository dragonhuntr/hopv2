import {
    type Message as AIMessage,
    type ChatResponse,
    convertToCoreMessages,
    createDataStreamResponse,
    streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models, DEFAULT_MODEL_ID, DEFAULT_TITLE_MODEL_ID } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
    generateUUID,
    getMostRecentUserMessage,
} from '@/lib/utils';

import {
    deleteChatById,
    getChatById,
    saveChat,
    saveMessages,
    deleteAllChatsByUserId,
} from '@/prisma/queries';

import { generateTitleFromUserMessage } from '@/actions';

export const maxDuration = 60;

export async function POST(request: Request) {
    const {
        id,
        messages,
        modelId,
    }: { id: string; messages: Array<AIMessage>; modelId: string } =
        await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
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

    await saveMessages({
        messages: [
            { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id, content: userMessage.content as string },
        ],
    });

    return createDataStreamResponse({
        execute: (dataStream) => {
            dataStream.writeData({
                type: 'user-message-id',
                content: userMessageId,
            });

            const result = streamText({
                model: customModel(model.apiIdentifier),
                system: systemPrompt,
                messages: coreMessages,
                maxSteps: 5,
                experimental_telemetry: {
                    isEnabled: true,
                    functionId: 'stream-text',
                },
            });

            result.mergeIntoDataStream(dataStream);

            result.on('finalMessage', async (message: AIMessage) => {
                if (session.user?.id) {
                    try {
                        await saveMessages({
                            messages: [{
                                id: generateUUID(),
                                chatId: id,
                                role: message.role,
                                content: message.content,
                                createdAt: new Date(),
                            }],
                        });
                    } catch (error) {
                        console.error('Failed to save chat');
                    }
                }
            });
        },
    });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        if (deleteAll === 'true') {
            // Wait for deletion to complete
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

        // Wait for deletion to complete
        await deleteChatById({ id });
        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request', {
            status: 500,
        });
    }
}