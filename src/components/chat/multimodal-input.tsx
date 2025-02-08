'use client';

import type { ChatRequestOptions, Attachment, CreateMessage, Message } from 'ai';
import React, { useRef, useEffect, useState, useCallback, type Dispatch, type SetStateAction, memo } from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import equal from 'fast-deep-equal';
import { saveModelId } from '@/app/(dashboard)/actions';

import { ArrowUpIcon, StopIcon, PaperclipIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/text-area';
import { PreviewAttachment } from './preview-attachment';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: (value: Array<Attachment> | ((prev: Array<Attachment>) => Array<Attachment>)) => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
  modelId: string;
  isVisionModel: boolean;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  modelId,
  isVisionModel,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

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
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Save model before sending message
    saveModelId(chatId, modelId);

    // Clear attachments if not using a vision model
    if (!isVisionModel) {
      setAttachments([]);
    }

    handleSubmit(undefined, {
      experimental_attachments: isVisionModel ? attachments : [],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    modelId,
    isVisionModel,
  ]);

  const uploadFile = async (file: File): Promise<Attachment | undefined> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, name, contentType } = data;

        return {
          url,
          name,
          contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
      return undefined;
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
      return undefined;
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = (await Promise.all(uploadPromises)).filter(
          (attachment): attachment is Attachment => attachment !== undefined
        );
        setAttachments((currentAttachments) => [...currentAttachments, ...uploadedAttachments]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const files = Array.from(event.dataTransfer.files);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = (await Promise.all(uploadPromises)).filter(
          (attachment): attachment is Attachment => attachment !== undefined
        );
        setAttachments((currentAttachments) => [...currentAttachments, ...uploadedAttachments]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {isVisionModel && (
        <input
          type="file"
          className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          tabIndex={-1}
        />
      )}

      {isVisionModel && (attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment 
              key={attachment.url} 
              attachment={attachment} 
              onDelete={async (attachment) => {
                try {
                  const response = await fetch(`/api/files/upload?pathname=${attachment.name}`, {
                    method: 'DELETE',
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to delete file');
                  }
                  
                  setAttachments(current => current.filter(a => a.url !== attachment.url));
                } catch (error) {
                  toast.error('Failed to delete file');
                }
              }}
            />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cn(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className,
          {
            'border-2 border-dashed border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-500/10': isDragOver && isVisionModel,
          },
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
        onDrop={(event) => {
          if (!isVisionModel) return;
          handleDrop(event);
        }}
        onDragOver={(event) => {
          if (!isVisionModel) return;
          handleDragOver(event);
        }}
        onDragLeave={() => {
          if (!isVisionModel) return;
          handleDragLeave();
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        <AttachmentsButton fileInputRef={fileInputRef} isLoading={isLoading} isVisionModel={isVisionModel} />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    return (
      prevProps.input === nextProps.input &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.modelId === nextProps.modelId &&
      prevProps.isVisionModel === nextProps.isVisionModel &&
      equal(prevProps.attachments, nextProps.attachments) &&
      equal(prevProps.messages, nextProps.messages)
    );
  },
);

function PureAttachmentsButton({
  fileInputRef,
  isLoading,
  isVisionModel,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isVisionModel: boolean;
}) {
  if (!isVisionModel) return null;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => fileInputRef.current?.click()}
      disabled={isLoading}
      className="flex-none"
    >
      <PaperclipIcon size={16} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});