"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/app/(auth)/auth"
import { generateUUID } from "@/lib/utils"
import { DEFAULT_MODEL_ID } from "@/lib/ai/models"
import { Chat } from "@/components/chat/chat"
import { ChatLayout } from "@/components/chat/chat-layout"
import { DataStreamHandler } from "@/components/chat/data-stream-handler"

export default function ChatPage() {
  const [selectedModelId] = useState<string>(DEFAULT_MODEL_ID)
  const [session, setSession] = useState<any>(null)
  const id = generateUUID()

  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession()
      setSession(session)
    }
    getSession()
  }, [])

  return (
    <ChatLayout user={session?.data?.user}>
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