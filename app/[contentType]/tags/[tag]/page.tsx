import { getAllPosts } from '../../../lib/mdx';
import { BlogCard } from '../../../components/BlogCard';
import { ContentBreadcrumb } from '../../../components/ContentBreadcrumb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ contentType: string; tag: string }> }): Promise<Metadata> {
  const { contentType, tag } = await params;
  
  // Handle the empty content type and tag case
  if (contentType === 'empty' && tag === 'empty') {
    return {
      title: 'No Tags Available | emerson',
      description: 'No tags are available at this time.',
    };
  }
  
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
  // Always return at least one path to satisfy Next.js static export requirements
  return [
    { contentType: 'empty', tag: 'empty' }
  ];
}

type PageProps = {
  params: Promise<{ contentType: string; tag: string }>;
};

export default async function TagPage({ params }: PageProps) {
  const { contentType, tag } = await params;
  
  // Handle the empty content type and tag case
  if (contentType === 'empty' && tag === 'empty') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">No Tags Available</h1>
        <p className="text-lg mb-4">There are no tags available at this time.</p>
        <p>Please add content with tags to see them displayed here.</p>
      </div>
    );
  }
  
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