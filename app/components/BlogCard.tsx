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

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full transition-all hover:shadow-md">
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
        <CardFooter className="text-sm text-muted-foreground">
          {formattedDate}
        </CardFooter>
      </Card>
    </Link>
  );
} 