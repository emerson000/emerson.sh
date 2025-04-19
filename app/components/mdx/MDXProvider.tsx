import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Alert } from './Alert';
import { CodeBlock } from './CodeBlock';
import { CustomImage } from './CustomImage';
import { Anchor } from './Anchor';
import { Checklist } from './Checklist';
const htmlComponent = (tag: string, className: string) => {
  const Component = ({ children }: { children: React.ReactNode }) => 
    React.createElement(tag, { className }, children);
  Component.displayName = `HTML${tag.toUpperCase()}`;
  return Component;
};

const components = {
  Alert,
  CodeBlock,
  h1: htmlComponent('h1', 'text-foreground'),
  h2: htmlComponent('h2', 'text-foreground mt-4 mb-2'),
  h3: htmlComponent('h3', 'text-foreground mt-4 mb-2'),
  h4: htmlComponent('h4', 'text-foreground'),
  h5: htmlComponent('h5', 'text-foreground'),
  h6: htmlComponent('h6', 'text-foreground'),
  p: htmlComponent('p', 'mb-2'),
  ul: htmlComponent('ul', 'list-inside mt-0 mb-0'),
  ol: htmlComponent('ol', 'list-decimal list-inside'),
  li: htmlComponent('li', ''),
  blockquote: htmlComponent('blockquote', 'border-l-2 border-gray-300 pl-4 py-2 italic'),
  a: Anchor,
  img: CustomImage,
  code: htmlComponent('code', 'bg-gray-100 p-1 rounded dark:bg-gray-800 not-prose font-bold'),
  Checklist,
};

type MDXProviderProps = {
  source: string;
};

export function MDXProvider({ source }: MDXProviderProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
    />
  );
} 