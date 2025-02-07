import { cn } from '@/lib/utils';
import React from 'react';

type MarkdownNode = {
  type: 'text' | 'heading' | 'paragraph' | 'code' | 'list' | 'listItem' | 'link' | 'bold';
  content: string;
  level?: number;
  children?: MarkdownNode[];
  href?: string;
};

interface MarkdownProps {
  children: string;
  className?: string;
}

const parseMarkdown = (markdown: string): MarkdownNode[] => {
  console.log(markdown)
  const lines = markdown.split('\n');
  const nodes: MarkdownNode[] = [];
  let currentNode: MarkdownNode | null = null;
  let isInCodeBlock = false;

  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (isInCodeBlock) {
        isInCodeBlock = false;
        currentNode = null;
      } else {
        isInCodeBlock = true;
        currentNode = { type: 'code', content: '' };
        nodes.push(currentNode);
      }
      continue;
    }

    if (isInCodeBlock && currentNode?.type === 'code') {
      currentNode.content = (currentNode.content ?? '') + line + '\n';
      continue;
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s(.+)/);
    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      nodes.push({
        type: 'heading',
        content: headingMatch[2].trim(),
        level: headingMatch[1].length,
      });
      continue;
    }

    // Handle lists
    const listMatch = line.match(/^(-|\*|\d+\.)\s(.+)/);
    if (listMatch && listMatch[2]) {
      if (!currentNode?.type?.includes('list')) {
        currentNode = {
          type: 'list',
          content: '',
          children: [],
        };
        nodes.push(currentNode);
      }
      if (currentNode) {
        currentNode.children = currentNode.children ?? [];
        currentNode.children.push({
          type: 'listItem',
          content: listMatch[2].trim(),
        });
      }
      continue;
    }

    // Handle paragraphs and inline elements
    if (line.trim() !== '') {
      const inlineContent = parseInlineElements(line);
      nodes.push({
        type: 'paragraph',
        content: line,
        children: inlineContent,
      });
    }
  }

  return nodes;
};

const parseInlineElements = (text: string): MarkdownNode[] => {
  const nodes: MarkdownNode[] = [];
  let currentText = '';

  // Simple inline parsing for links and bold, but NOT code blocks
  const regex = /(!?\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(__([^_]+)__)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[0].startsWith('*') || match[0].startsWith('_')) {
      // Bold text
      nodes.push({
        type: 'bold',
        content: match[5] || match[7] || '', // Group 5 for **, group 7 for __
      });
    } else {
      // Link
      nodes.push({
        type: 'link',
        content: match[2] || '',
        href: match[3] || '#',
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return nodes;
};

const renderNode = (node: MarkdownNode, index: number): React.ReactNode => {
  switch (node.type) {
    case 'heading':
      const HeadingTag = `h${node.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          key={index}
          className="font-semibold mt-4 mb-2"
        >
          {node.content}
        </HeadingTag>
      );

    case 'code':
      return (
        <pre key={index} className="bg-muted p-4 rounded-md border border-border my-2">
          <code>{node.content}</code>
        </pre>
      );

    case 'bold':
      return (
        <strong key={index} className="font-bold">
          {node.content}
        </strong>
      );

    case 'list':
      return (
        <ul key={index} className="my-2 list-disc pl-6">
          {node.children?.map((item, i) => (
            <li key={i} className="my-1">
              {item.content}
            </li>
          ))}
        </ul>
      );

    case 'link':
      return (
        <a
          key={index}
          href={node.href || '#'}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.content}
        </a>
      );

    case 'paragraph':
      return (
        <p key={index} className="my-2 leading-relaxed">
          {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
        </p>
      );

    default:
      return <span key={index}>{node.content}</span>;
  }
};

export function Markdown({ children, className }: MarkdownProps) {
  const nodes = parseMarkdown(children);

  return (
    <div className={cn(
      'prose prose-neutral dark:prose-invert max-w-none',
      className
    )}>
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
} 