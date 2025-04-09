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
import moment from 'moment';

interface BlogCardProps {
  post: Post;
  includeSectionBadges?: boolean;
}

export function BlogCard({ post, includeSectionBadges = false }: BlogCardProps) {
  const formattedDate = moment.utc(post.date).format('MMMM D, YYYY');

  return (
    <Link href={`/${post.contentType}/${post.slug}`}>
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
          <span>{formattedDate}</span>
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