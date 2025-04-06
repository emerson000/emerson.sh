import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function CustomImage({ src, alt, width, height, className }: CustomImageProps) {
  // If the src is an external URL, use it directly
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 600}
        className={cn('rounded-md', className)}
        unoptimized
      />
    );
  }

  // For local images in the content directory
  // Remove leading slash if present
  const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
  
  // Use a relative path instead of an absolute path to avoid Next.js routing issues
  // This will look for images in the public directory
  return (
    <Image
      src={`/${cleanSrc}`}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={cn('rounded-md', className)}
    />
  );
} 