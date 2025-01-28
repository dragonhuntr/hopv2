import { type Message } from 'ai';
import { auth } from '@/server/auth';

export const maxDuration = 60;

export async function POST(request: Request) {
    const { messages } = await request.json() as { messages: Message[] };

    const session = await auth();

    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    if (!messages.length) {
        return new Response('No messages provided', { status: 400 });
    }

    // Get the last message - we know it exists since we checked length
    const lastMessage = messages[messages.length - 1]!;
    
    return new Response(JSON.stringify({
        role: 'assistant',
        content: `Echo: ${lastMessage.content}`,
    }));
}

export async function DELETE(_request: Request) {
    const session = await auth();

    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    return new Response('Chat deleted', { status: 200 });
}