import Link from 'next/link';
import { Post } from '../lib/mdx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ContentBreadcrumbProps {
  contentType: string;
  post?: Post;
}

export function ContentBreadcrumb({ contentType, post }: ContentBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" title="Return to Homepage">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {post ? (
            <BreadcrumbLink asChild>
              <Link 
                href={`/${contentType}`} 
                className="capitalize"
                title={`Browse all ${contentType} articles`}
              >
                {contentType}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="capitalize">{contentType}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {post && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 