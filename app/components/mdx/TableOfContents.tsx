'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  /**
   * Minimum heading level to include (default: 2 for h2)
   */
  minLevel?: number;
  /**
   * Maximum heading level to include (default: 6 for h6)
   */
  maxLevel?: number;
}

export function TableOfContents({ minLevel = 1, maxLevel = 2 }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create a selector for the configured heading levels
    const headingSelectors = [];
    for (let i = minLevel; i <= Math.min(maxLevel, 6); i++) {
      headingSelectors.push(`h${i}`);
    }
    
    if (headingSelectors.length === 0) return;
    
    const selector = headingSelectors.join(', ');
    
    const elements = Array.from(document.querySelectorAll(selector))
      .filter(element => element.id)
      .map(element => ({
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.substring(1))
      }));
    
    setHeadings(elements);
    
    // Animate in after a small delay
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [minLevel, maxLevel]);

  // Handle smooth scrolling
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
    const element = document.getElementById(id);
    if (!element) return;
    
    // Scroll to the element with smooth behavior
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    
    // Update URL without reloading the page
    window.history.pushState(null, '', `#${id}`);
  };

  // Return a placeholder with the same dimensions during initial render
  if (!mounted) {
    return (
      <div className="toc my-0 pt-2 pb-0 px-4 border border-gray-200 rounded dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 w-fit max-w-md min-h-[100px] opacity-0">
        <h2 className="text-sm font-semibold mt-0 p-0 text-muted-foreground">Table of Contents</h2>
        <ul className="space-y-1 text-sm">
          <li className="h-5"></li>
          <li className="h-5"></li>
          <li className="h-5"></li>
        </ul>
      </div>
    );
  }

  // Don't render if no headings found after mounting
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav 
      className="toc my-0 pt-2 pb-0 px-4 border border-gray-200 rounded dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 w-fit max-w-md transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <h2 className="text-sm font-semibold mt-0 p-0 text-muted-foreground">Table of Contents</h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ 
              paddingLeft: `${(heading.level - minLevel) * 0.75}rem`,
              marginTop: heading.level === minLevel ? '0.5rem' : '0'
            }}
          >
            <Link 
              href={`#${heading.id}`}
              onClick={(e) => handleLinkClick(e, heading.id)}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 