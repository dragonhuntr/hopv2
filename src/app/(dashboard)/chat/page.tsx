"use client"

import { useChat } from "ai/react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { generateUUID } from "@/lib/utils"
import { models, type Model } from "@/lib/ai/models"
import { Chat } from "@/components/chat/chat"
import { ChatLayout } from "@/components/chat/chat-layout"

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]!)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    onError: (error) => {
      toast.error(error.message)
    },
    id: generateUUID()
  })
  const { data: session } = useSession()

  return (
    <ChatLayout user={session?.user}>
      <Chat
        id={generateUUID()}
        initialMessages={messages}
        selectedModelId={selectedModel.id}
        selectedVisibilityType="private"
        isReadonly={false}
      />
    </ChatLayout>
  )
}