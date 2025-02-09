import { type User } from '@prisma/client';
import { prisma } from '@/lib/utils';
import { AttachmentService } from '@/lib/attachments/attachment-service';

const attachmentService = new AttachmentService();

export async function getUser(email: string): Promise<User | null> {

  const data =  await prisma.user.findUnique({
    where: { email }
  });

  return data
}

export async function saveChat({
  id,
  userId,
  title,
  model,
}: {
  id: string;
  userId: string;
  title: string;
  model: string;
}) {
  try {
    return await prisma.chat.create({
      data: {
        id,
        createdAt: new Date(),
        userId,
        title,
        model,
      }
    });
  } catch (error) {
    console.log(error)
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await prisma.message.deleteMany({
      where: { chatId: id }
    });
    return await prisma.chat.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await prisma.chat.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.log(error)
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  console.log('getChatById', id)
  try {
    return await prisma.chat.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<{
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
  attachments?: Array<{
    id: string;  // Attachment ID is required
    url: string;
    name: string;
    contentType: string;
  }>;
}> }) {
  try {
    // Save messages first
    await prisma.message.createMany({
      data: messages.map(({ attachments, ...message }) => message)
    });

    // Then activate any attachments for messages that have them
    for (const message of messages) {
      if (message.attachments?.length) {
        // Get the chat to get the userId
        const chat = await prisma.chat.findUnique({
          where: { id: message.chatId },
          select: { userId: true }
        });

        if (!chat) {
          throw new Error('Chat not found');
        }

        await attachmentService.activateAttachments(
          message.attachments.map(a => a.id),
          message.id,
          chat.userId
        );
      }
    }
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.message.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await prisma.message.deleteMany({
      where: {
        chatId,
        createdAt: { gte: timestamp }
      }
    });
  } catch (error) {
    console.error('Failed to delete messages by id after timestamp from database');
    throw error;
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { visibility }
    });
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function updateChatModelById({
  chatId,
  model,
}: {
  chatId: string;
  model: string;
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { model },
    });
  } catch (error) {
    console.error('Failed to update chat model in database', error);
    throw error;
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    await prisma.message.deleteMany({
      where: { 
        chat: {
          userId: userId
        }
      }
    });
    return await prisma.chat.deleteMany({
      where: { userId }
    });
  } catch (error) {
    console.error('Failed to delete all chats for user from database');
    throw error;
  }
}

export async function createAttachment({
  name,
  url,
  contentType,
  messageId,
}: {
  name: string;
  url: string;
  contentType: string;
  messageId: string;
}) {
  try {
    return await prisma.attachment.create({
      data: {
        name,
        url,
        contentType,
        messageId,
      }
    });
  } catch (error) {
    console.error('Failed to create attachment in database');
    throw error;
  }
}

export async function deleteAttachment(id: string) {
  try {
    return await prisma.attachment.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to delete attachment from database');
    throw error;
  }
}

export async function getAttachment(id: string) {
  try {
    return await prisma.attachment.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to get attachment from database');
    throw error;
  }
}