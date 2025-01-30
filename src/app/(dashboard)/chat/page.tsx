"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChevronDown, SendHorizontal, Loader2 } from "lucide-react"
import { models, type Model } from "@/lib/ai/models"
import { useState } from "react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { generateUUID } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from "@/components/ui/sidebar"
import { SidebarHistory } from "@/components/chat/sidebar-history"
import { SidebarToggle } from "@/components/chat/sidebar-toggle"

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]!)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    onError: (error) => {
      toast.error(error.message)
    },
    id: generateUUID()
  })
  const { data: session } = useSession()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHistory user={session?.user} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <SidebarToggle />
                <h1 className="text-lg font-semibold text-foreground">HopV2</h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <span>{selectedModel.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Select Model</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {models.map((model) => (
                      <DropdownMenuItem 
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className="flex flex-col items-start gap-1"
                      >
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "assistant" 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="border-t bg-background p-4">
              <div className="relative mx-auto flex max-w-2xl items-center gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="w-4 h-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}