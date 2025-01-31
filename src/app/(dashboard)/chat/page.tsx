"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { generateUUID } from "@/lib/utils"
import { DEFAULT_MODEL_ID, models } from "@/lib/ai/models"
import { Chat } from "@/components/chat/chat"
import { ChatLayout } from "@/components/chat/chat-layout"
import { DataStreamHandler } from "@/components/chat/data-stream-handler"

export default function ChatPage() {
  const [selectedModelId] = useState<string>(DEFAULT_MODEL_ID)
  const { data: session } = useSession()
  const id = generateUUID()

  return (
    <ChatLayout user={session?.user}>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </ChatLayout>
  )
}