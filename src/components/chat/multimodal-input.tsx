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
    handleSubmit();
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cn(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className
        )}
        rows={2}
        autoFocus
        onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <Button
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              stop();
            }}
          >
            <StopIcon size={3.5} />
          </Button>
        ) : (
          <Button
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0}
          >
            <ArrowUpIcon size={3.5} />
          </Button>
        )}
      </div>
    </div>
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