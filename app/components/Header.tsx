import Link from 'next/link';
import { getContentTypes } from '../lib/mdx';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import { House } from 'lucide-react';

export function Header() {
  const contentTypes = getContentTypes();

  return (
    <header className="border-b">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
            <Logo />
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium p-2 hover:bg-accent rounded-md hover:text-primary transition-colors capitalize">
              <House className="w-5 h-5" />
            </Link>
            {contentTypes.map((type) => (
              <Link
                key={type.name}
                href={`/${type.name}`}
                className="text-sm font-medium hover:text-primary transition-colors capitalize"
              >
                {type.name}
              </Link>
            ))}
            <div className="relative">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 