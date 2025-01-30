import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none break-words prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        'prose-p:leading-relaxed prose-p:my-2 prose-p:break-words',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-border prose-code:before:content-none prose-code:after:content-none',
        'prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-semibold',
        'prose-hr:border-border',
        'prose-img:rounded-md',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-2',
        'prose-ul:my-2 prose-li:my-0 marker:prose-ul:text-foreground/50',
        'prose-ol:my-2 marker:prose-ol:text-foreground/50',
        className,
      )}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
    >
      {children}
    </ReactMarkdown>
  );
} 