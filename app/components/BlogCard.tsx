import Link from 'next/link';
import { Post } from '../lib/mdx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface BlogCardProps {
  post: Post;
  includeSectionBadges?: boolean;
}

export function BlogCard({ post, includeSectionBadges = false }: BlogCardProps) {
  const formattedDate = formatDate(post.date);

  return (
    <Link 
      href={`/${post.contentType}/${post.slug}`}
      title={`Read ${post.title} - ${post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1)}`}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {post.excerpt && (
            <CardDescription className="text-base">
              {post.excerpt}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground flex justify-between items-center">
          {post.show_dates !== false ? <span>{formattedDate}</span> : <div></div>}
          {includeSectionBadges && (
            <Badge variant="secondary" className="capitalize">
              {post.contentType}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
} 