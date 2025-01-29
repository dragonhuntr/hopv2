import {
    type Message as AIMessage,
    type CoreUserMessage,
    convertToCoreMessages,
    createDataStreamResponse,
    streamText,
    generateText,
} from 'ai';
import { auth } from '@/server/auth';
import { customModel } from '@/lib/ai';
import { models, DEFAULT_MODEL_ID, DEFAULT_TITLE_MODEL_ID } from '@/lib/ai/models';
import { systemPrompt, titlePrompt } from '@/lib/ai/prompts';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/server/db/schema';
import { generateTitleFromUserMessage } from '@/app/(dashboard)/chat/actions';

export const maxDuration = 60;

export async function POST(request: Request) {
    const {
        messages,
        modelId = DEFAULT_MODEL_ID,
    }: { messages: Array<AIMessage>; modelId: string } =
        await request.json();

    const session = await auth();

    const model = models.find((model) => model.id === modelId);

    if (!model) {
        return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = coreMessages.find(msg => msg.role === 'user') as CoreUserMessage | undefined;

    if (!userMessage) {
        return new Response('No user message found', { status: 400 });
    }

    // Generate a new chat ID if this is a new conversation
    const chatId = uuidv4();
    const chat = await db.chat.findFirst({
        where: {
            userId: session!.user.id,
            messages: {
                some: {
                    content: userMessage.content as string
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!chat) {
        const title = await generateTitleFromUserMessage({ message: userMessage, model: DEFAULT_TITLE_MODEL_ID });
        await db.chat.create({
            data: {
                id: chatId,
                userId: session!.user.id,
                title,
                createdAt: new Date(),
            }
        });
    }

    const userMessageId = uuidv4();
    const userContent = typeof userMessage.content === 'string' 
        ? userMessage.content 
        : JSON.stringify(userMessage.content);

    await db.message.create({
        data: {
            id: userMessageId,
            chatId: chat?.id ?? chatId,
            role: userMessage.role,
            content: userContent,
            createdAt: new Date(),
        }
    });

    return createDataStreamResponse({
        execute: async (dataStream) => {
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

            // Handle the final message
            const { text: content } = await generateText({
                model: customModel(model.apiIdentifier),
                system: systemPrompt,
                messages: coreMessages,
            });

            if (session!.user?.id) {
                try {
                    await db.message.create({
                        data: {
                            id: uuidv4(),
                            chatId: chat?.id ?? chatId,
                            role: 'assistant',
                            content,
                            createdAt: new Date(),
                        }
                    });
                } catch (error) {
                    console.error('Failed to save chat');
                }
            }
        },
    });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    const session = await auth();

    try {
        if (deleteAll === 'true') {
            await db.chat.deleteMany({
                where: { userId: session!.user.id }
            });
            return new Response('All chats deleted', { status: 200 });
        }

        if (!id) {
            return new Response('Not Found', { status: 404 });
        }

        const chat = await db.chat.findUnique({
            where: { id }
        });

        if (!chat || chat.userId !== session!.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        await db.chat.delete({
            where: { id }
        });
        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request', {
            status: 500,
        });
    }
}