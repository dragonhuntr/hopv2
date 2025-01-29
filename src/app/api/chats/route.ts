import { auth } from '@/server/auth';
import { db } from '@/server/db/schema';

export async function GET(request: Request) {
    const session = await auth();

    const chats = await db.chat.findMany({
        where: { userId: session!.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    return new Response(JSON.stringify(chats));
}

export async function DELETE(request: Request) {
    const session = await auth();

    try {
        await db.chat.deleteMany({
            where: { userId: session!.user.id }
        });
        return new Response('All chats deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request', {
            status: 500,
        });
    }
} 