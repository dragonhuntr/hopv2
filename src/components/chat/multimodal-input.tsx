'use client';

import type { ChatRequestOptions } from 'ai';
import React, { useRef, useEffect, memo } from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { cn } from '@/lib/utils';

import { ArrowUpIcon, StopIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/text-area';

interface MultimodalInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}

function PureMultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  handleSubmit,
  className,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = () => {
    if (isLoading || input.trim().length === 0) return;
    
    handleSubmit();
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
      className={cn(
        "relative w-full flex flex-col gap-2 md:gap-4 bg-background rounded-lg border shadow-sm",
        className
      )}
    >
      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!isLoading && input.trim().length > 0) {
              submitForm();
            }
          }
        }}
        className="min-h-[60px] md:min-h-[98px] w-full resize-none bg-transparent px-3 md:px-4 py-3 md:py-[1.3rem] focus-within:outline-none text-sm md:text-base"
        autoFocus
      />
      <div className="absolute right-2 md:right-4 bottom-2 md:bottom-4 flex items-center gap-2">
        {isLoading ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={stop}
          >
            <StopIcon />
            <span className="sr-only">Stop generating</span>
          </Button>
        ) : (
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={input.trim().length === 0}
          >
            <ArrowUpIcon />
            <span className="sr-only">Send message</span>
          </Button>
        )}
      </div>
    </form>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    return true;
  },
);