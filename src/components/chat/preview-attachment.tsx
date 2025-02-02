import type { Attachment } from 'ai';
import Image from 'next/image';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { LoaderIcon } from '@/components/ui/icons';

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
}

function PurePreviewAttachment({ attachment, isUploading }: PreviewAttachmentProps) {
  const { name, url, contentType } = attachment;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-20 h-16 bg-muted rounded-md flex items-center justify-center">
        {contentType?.startsWith('image') && url ? (
          <Image
            src={url}
            alt={name ?? 'Image attachment'}
            fill
            className="rounded-md object-cover"
          />
        ) : (
          <div className="text-xs text-muted-foreground">
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