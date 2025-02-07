import { notFound } from 'next/navigation';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Chat } from '@/components/chat/chat';
import { DEFAULT_MODEL_ID, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/prisma/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import { ChatLayout } from '@/components/chat/chat-layout';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  // Run queries in parallel
  const [chat, session] = await Promise.all([
    getChatById({ id }),
    await auth.api.getSession({
      headers: await headers(),
    })
  ]);

  if (!chat) {
    notFound();
  }

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const isReadonly = session?.user?.id !== chat.userId;
  const selectedModelId = models.find((model) => model.id === chat.model)?.id || DEFAULT_MODEL_ID;

  // Get messages after auth check
  const messagesFromDb = await getMessagesByChatId({ id });

  return (
    <ChatLayout user={session?.user}>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={isReadonly}
      />
      <DataStreamHandler id={id} />
    </ChatLayout>
  );
}
