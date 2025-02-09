import type { Attachment } from 'ai';
import Image from 'next/image';
import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { LoaderIcon, TrashIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onDelete?: (attachment: Attachment) => Promise<void>;
}

function PurePreviewAttachment({ attachment, isUploading, onDelete }: PreviewAttachmentProps) {
  const { name, url, contentType } = attachment;
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(attachment);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div 
        className="relative w-20 h-16 bg-muted rounded-md flex items-center justify-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {contentType?.startsWith('image') && url ? (
          <>
            <Image
              src={url}
              alt={`Attachment: ${name || 'Untitled image'}`}
              fill
              className="rounded-md object-cover"
              sizes="80px"
            />
            {isHovered && !isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-destructive hover:bg-white"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Remove attachment"
                >
                  {isDeleting ? (
                    <div className="animate-spin">
                      <LoaderIcon size={16} />
                    </div>
                  ) : (
                    <TrashIcon />
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground text-center px-1">
            {contentType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
            <div className="animate-spin text-muted-foreground">
              <LoaderIcon />
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground max-w-16 truncate">
        {name || 'Uploading...'}
      </span>
    </div>
  );
}

export const PreviewAttachment = memo(PurePreviewAttachment); 