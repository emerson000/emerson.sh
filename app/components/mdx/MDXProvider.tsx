import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Alert } from './Alert';
import { CodeBlock } from './CodeBlock';
import { CustomImage } from './CustomImage';
import { Anchor } from './Anchor';
import { Checklist } from './Checklist';
import { CryptonymGenerator } from './CryptonymGenerator';
import { TableOfContents } from './TableOfContents';
import remarkGfm from 'remark-gfm';

const htmlComponent = (tag: string, className: string) => {
  const Component = ({ children }: { children: React.ReactNode }) => 
    React.createElement(tag, { className }, children);
  Component.displayName = `HTML${tag.toUpperCase()}`;
  return Component;
};

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className: string;
  children: React.ReactNode;
}

const Heading = ({ level, className, children }: HeadingProps) => {
  const content = React.Children.toArray(children).join('');
  const id = content
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  return React.createElement(
    `h${level}`,
    { id, className },
    children
  );
};

const components = {
  Alert,
  CodeBlock,
  h1: ({ children }: { children: React.ReactNode }) => (
    <Heading level={1} className="text-foreground">{children}</Heading>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <Heading level={2} className="text-foreground mt-4 mb-2">{children}</Heading>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <Heading level={3} className="text-foreground mt-4 mb-2">{children}</Heading>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <Heading level={4} className="text-foreground">{children}</Heading>
  ),
  h5: ({ children }: { children: React.ReactNode }) => (
    <Heading level={5} className="text-foreground">{children}</Heading>
  ),
  h6: ({ children }: { children: React.ReactNode }) => (
    <Heading level={6} className="text-foreground">{children}</Heading>
  ),
  p: htmlComponent('p', 'mb-2'),
  ul: htmlComponent('ul', 'list-inside mt-0 mb-0'),
  ol: htmlComponent('ol', 'list-decimal list-inside'),
  li: htmlComponent('li', ''),
  blockquote: htmlComponent('blockquote', 'border-l-2 border-gray-300 pl-4 py-2 italic text-muted-foreground'),
  a: Anchor,
  img: CustomImage,
  code: htmlComponent('code', 'bg-gray-100 p-1 rounded dark:bg-gray-800 not-prose font-bold'),
  // Table components
  table: htmlComponent('table', 'w-full border-collapse my-4 text-foreground'),
  thead: htmlComponent('thead', 'bg-muted text-foreground'),
  tbody: htmlComponent('tbody', ''),
  tr: htmlComponent('tr', 'border-b border-muted-foreground/20'),
  th: htmlComponent('th', 'p-2 text-left font-semibold text-muted-foreground'),
  td: htmlComponent('td', 'p-2'),
  Checklist,
  CryptonymGenerator,
  TableOfContents,
};

type MDXProviderProps = {
  source: string;
};

export function MDXProvider({ source }: MDXProviderProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
} 