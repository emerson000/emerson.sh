import { getAllPosts, getContentTypes } from '../../../lib/mdx';
import { BlogCard } from '../../../components/BlogCard';
import { ContentBreadcrumb } from '../../../components/ContentBreadcrumb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ contentType: string; tag: string }> }): Promise<Metadata> {
  const { contentType, tag } = await params;
  const posts = getAllPosts(contentType, tag);
  
  if (!posts.length) {
    return {
      title: 'Not Found',
    };
  }
  
  const capitalizedContentType = contentType.charAt(0).toUpperCase() + contentType.slice(1);
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  
  return {
    title: `${capitalizedTag} | ${capitalizedContentType} | emerson`,
    description: `Browse ${contentType} tagged with ${tag}`,
  };
}

export async function generateStaticParams() {
  const contentTypes = getContentTypes();
  const params: Array<{ contentType: string; tag: string }> = [];

  for (const type of contentTypes) {
    const posts = getAllPosts(type.name);
    const tags = new Set<string>();
    
    // Collect all unique tags
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });

    // Generate params for each tag
    tags.forEach(tag => {
      params.push({
        contentType: type.name,
        tag: tag.toLowerCase(),
      });
    });
  }

  return params;
}

type PageProps = {
  params: Promise<{ contentType: string; tag: string }>;
};

export default async function TagPage({ params }: PageProps) {
  const { contentType, tag } = await params;
  // Convert URL tag to lowercase for consistency
  const lowercaseTag = tag.toLowerCase();
  const posts = getAllPosts(contentType, lowercaseTag);

  if (!posts.length) {
    notFound();
  }

  // Find the original tag case from the first post that has this tag
  const originalTag = posts[0].tags?.find(t => t.toLowerCase() === lowercaseTag) || tag;
  const capitalizedTag = originalTag.charAt(0).toUpperCase() + originalTag.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} />
      <h1 className="text-4xl font-bold mb-8">
        {capitalizedTag}
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 