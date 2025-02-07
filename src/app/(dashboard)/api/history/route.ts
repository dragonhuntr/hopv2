import { auth } from '@/lib/auth';
import { getChatsByUserId } from '@/prisma/queries';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session?.user?.id) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const chats = await getChatsByUserId({ id: session.user.id });
  return Response.json(chats);
} 