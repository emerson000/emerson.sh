import Link from 'next/link';
import { getContentTypes } from '../lib/mdx';

export function Header() {
  const contentTypes = getContentTypes();

  return (
    <header className="border-b">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Home
          </Link>
          <div className="flex gap-6">
            {contentTypes.map((type) => (
              <Link
                key={type.name}
                href={`/${type.name}`}
                className="text-sm font-medium hover:text-primary transition-colors capitalize"
              >
                {type.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
} 