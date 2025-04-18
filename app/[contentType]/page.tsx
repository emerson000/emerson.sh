import { getAllPosts, getContentTypes } from '../lib/mdx';
import { BlogCard } from '../components/BlogCard';
import { ContentBreadcrumb } from '../components/ContentBreadcrumb';
import { TagBadge } from '../components/TagBadge';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ contentType: string }> }): Promise<Metadata> {
  const { contentType } = await params;
  
  // Handle the empty content type case
  if (contentType === 'empty') {
    return {
      title: 'No Content Available | emerson',
      description: 'No content types are available at this time.',
    };
  }
  
  const posts = getAllPosts(contentType);
  
  if (!posts.length) {
    return {
      title: 'Not Found',
    };
  }
  
  const capitalizedContentType = contentType.charAt(0).toUpperCase() + contentType.slice(1);
  
  return {
    title: `${capitalizedContentType} | emerson`,
    description: `Browse ${contentType}`,
  };
}

export async function generateStaticParams() {
  const contentTypes = getContentTypes();
  return contentTypes.map(type => ({
    contentType: type.name
  }));
}

type PageProps = {
  params: Promise<{ contentType: string }>;
};

export default async function ContentTypePage({ params }: PageProps) {
  const { contentType } = await params;
  
  // Handle the empty content type case
  if (contentType === 'empty') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
        <p className="text-lg mb-4">There are no content types available at this time.</p>
        <p>Please add content to the content directory to see it displayed here.</p>
      </div>
    );
  }
  
  const posts = getAllPosts(contentType);

  if (!posts.length) {
    notFound();
  }

  // Extract unique tags from all posts
  const uniqueTags = Array.from(
    new Set(posts.flatMap(post => post.tags || []))
  ).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} />
      <h1 className="text-4xl font-bold mb-4 capitalize">{contentType}</h1>
      {uniqueTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {uniqueTags.map((tag) => (
            <TagBadge key={tag} tag={tag} contentType={contentType} />
          ))}
        </div>
      )}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 