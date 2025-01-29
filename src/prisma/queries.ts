import { PrismaClient, type User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt-ts';

const prisma = new PrismaClient();

export async function getUser(email: string): Promise<User | null> {

  const data =  await prisma.user.findUnique({
    where: { email }
  });

  return data
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await prisma.user.create({
      data: { email, password: hash }
    });
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
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
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
}> }) {
  try {
    return await prisma.message.createMany({
      data: messages
    });
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

export async function updateChatVisiblityById({
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
    // Delete related records first due to foreign key constraints
    await prisma.vote.deleteMany({
      where: { 
        chat: {
          userId: userId
        }
      }
    });
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