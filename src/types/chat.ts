export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  visibility: 'private' | 'public';
  modelId: string;
  userId: string;
}
