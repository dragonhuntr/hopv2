import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSWRConfig } from 'swr';
import type { Message, VisibilityType } from '@/types/chat';
import type { Attachment } from 'ai';
import { models } from '@/lib/ai/models';

interface UseChatConfigProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
}

interface UseChatConfigReturn {
  currentModelId: string;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  chatConfig: {
    id: string;
    body: { id: string; modelId: string };
    initialMessages: Message[];
    experimental_throttle: number;
    onFinish: () => void;
    onResponse: () => void;
  };
  handleModelChange: (modelId: string) => void;
  isVisionModel: boolean;
}

/**
 * Custom hook to manage chat configuration and state
 * Handles model selection, attachments, and chat configuration
 */
export function useChatConfig({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
}: UseChatConfigProps): UseChatConfigReturn {
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  
  // State
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Stable refs
  const mutateRef = useRef(mutate);
  
  // Update stable refs
  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);
  
  // Memoized handlers
  const handleMutate = useCallback(() => {
    mutateRef.current('/api/history');
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setCurrentModelId(modelId);
  }, []);

  // Chat configuration
  const chatConfig = useMemo(() => ({
    id,
    body: { id, modelId: currentModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: handleMutate,
    onResponse: () => {
      handleMutate();
      if (pathname === '/chat') {
        history.replaceState({}, '', `/chat/${id}`);
      }
    }
  }), [id, currentModelId, initialMessages, handleMutate, pathname]);

  // Model capabilities
  const isVisionModel = useMemo(() => 
    models.find(m => m.id === currentModelId)?.vision ?? false
  , [currentModelId]);

  return {
    currentModelId,
    attachments,
    setAttachments,
    chatConfig,
    handleModelChange,
    isVisionModel,
  };
} 