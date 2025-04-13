import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  tag: string;
  contentType: string;
}

export function TagBadge({ tag, contentType }: TagBadgeProps) {
  return (
    <Link href={`/${contentType}/tags/${tag.toLowerCase()}`}>
      <Badge variant="outline" className="hover:bg-accent transition-colors">
        {tag}
      </Badge>
    </Link>
  );
} 