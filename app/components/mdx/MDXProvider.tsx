import { MDXRemote } from 'next-mdx-remote/rsc';
import { Alert } from './Alert';
import { CodeBlock } from './CodeBlock';

const components = {
  Alert,
  CodeBlock,
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