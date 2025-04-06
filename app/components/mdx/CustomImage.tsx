import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CustomImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function CustomImage({ 
  src, 
  alt, 
  className,
  aspectRatio = '16/9',
}: CustomImageProps) {
  // If the src is an external URL, use it directly
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return (
      <span className="relative block w-full my-4" style={{ aspectRatio: aspectRatio }}>
        <Image
          src={src}
          alt={alt}
          fill
          className={cn('rounded-md object-cover', className)}
          unoptimized
          sizes="100vw"
        />
      </span>
    );
  }

  // For local images in the content directory
  // Remove leading slash if present
  const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
  
  // Use a relative path instead of an absolute path to avoid Next.js routing issues
  // This will look for images in the public directory
  return (
    <span className="relative block w-full my-4" style={{ aspectRatio: aspectRatio }}>
      <Image
        src={`/${cleanSrc}`}
        alt={alt}
        fill
        className={cn('rounded-md object-cover', className)}
        sizes="100vw"
        quality={90}
        priority={false}
        loading="lazy"
      />
    </span>
  );
} 