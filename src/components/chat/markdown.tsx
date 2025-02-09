import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn(
      'prose prose-neutral dark:prose-invert max-w-none break-words',
      '[&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border',
      '[&_code]:px-1.5 [&_code]:rounded-md [&_code]:bg-muted [&_code]:font-mono [&_code]:text-sm',
      '[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline',
      '[&_p]:leading-relaxed',
      '[&_ul]:list-disc [&_ul]:pl-6',
      '[&_ol]:list-decimal [&_ol]:pl-6',
      '[&_h1]:font-semibold',
      '[&_h2]:font-semibold',
      '[&_h3]:font-semibold',
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="whitespace-pre-wrap" {...props} />
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}