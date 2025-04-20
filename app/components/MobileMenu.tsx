'use client';

import Link from 'next/link';
import { House, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuProps {
  contentTypes: Array<{ name: string }>;
}

export function MobileMenu({ contentTypes }: MobileMenuProps) {
  return (
    <div className="md:hidden flex items-center gap-4">
      <ThemeToggle />
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-accent rounded-md">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-4 mt-4">
            <SheetClose asChild>
              <Link 
                href="/" 
                title="Home"
                className="text-sm font-medium p-2 hover:bg-accent rounded-md hover:text-primary transition-colors capitalize flex items-center gap-2"
              >
                <House className="w-5 h-5" />
                Home
              </Link>
            </SheetClose>
            {contentTypes.map((type) => (
              <SheetClose key={type.name} asChild>
                <Link
                  href={`/${type.name}`}
                  title={`View ${type.name}`}
                  className="text-sm font-medium p-2 hover:bg-accent rounded-md hover:text-primary transition-colors capitalize"
                >
                  {type.name}
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 