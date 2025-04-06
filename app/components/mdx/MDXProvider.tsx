import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Alert } from './Alert';
import { CodeBlock } from './CodeBlock';
import { CustomImage } from './CustomImage';

const htmlComponent = (tag: string, className: string) => {
  const Component = ({ children }: { children: React.ReactNode }) => 
    React.createElement(tag, { className }, children);
  Component.displayName = `HTML${tag.toUpperCase()}`;
  return Component;
};

const components = {
  Alert,
  CodeBlock,
  h1: htmlComponent('h1', 'text-4xl font-bold mb-4'),
  h2: htmlComponent('h2', 'text-3xl font-bold mb-3'),
  h3: htmlComponent('h3', 'text-2xl font-bold mb-2'),
  h4: htmlComponent('h4', 'text-xl font-bold mb-2'),
  h5: htmlComponent('h5', 'text-lg font-bold mb-2'),
  h6: htmlComponent('h6', 'text-base font-bold mb-2'),
  p: htmlComponent('p', 'mb-4'),
  ul: htmlComponent('ul', 'mb-4 list-disc list-inside'),
  ol: htmlComponent('ol', 'mb-4 list-decimal list-inside'),
  li: htmlComponent('li', 'mb-2'),
  blockquote: htmlComponent('blockquote', 'border-l-2 border-gray-300 pl-4 py-2 italic'),
  a: htmlComponent('a', 'text-blue-500 hover:underline'),
  img: CustomImage,
  code: htmlComponent('code', 'bg-gray-100 p-1 rounded dark:bg-gray-800'),
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