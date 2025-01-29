import { auth } from '@/server/auth';
import { db } from '@/server/db/schema';

export async function GET(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    const session = await auth();

    const chat = await db.chat.findUnique({
        where: { 
            id: params.chatId,
            userId: session!.user.id
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if (!chat) {
        return new Response('Not Found', { status: 404 });
    }

    return new Response(JSON.stringify(chat));
}

export async function DELETE(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    const session = await auth();

    try {
        const chat = await db.chat.findUnique({
            where: { 
                id: params.chatId,
                userId: session!.user.id
            }
        });

        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }

        await db.chat.delete({
            where: { id: params.chatId }
        });

        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request', {
            status: 500,
        });
    }
} 