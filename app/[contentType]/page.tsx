import { getAllPosts, getContentTypes } from '../lib/mdx';
import { BlogCard } from '../components/BlogCard';
import { ContentBreadcrumb } from '../components/ContentBreadcrumb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ contentType: string }> }): Promise<Metadata> {
  const { contentType } = await params;
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
  return contentTypes.map((type) => ({
    contentType: type.name,
  }));
}

type PageProps = {
  params: Promise<{ contentType: string }>;
};

export default async function ContentTypePage({ params }: PageProps) {
  const { contentType } = await params;
  const posts = getAllPosts(contentType);

  if (!posts.length) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} />
      <h1 className="text-4xl font-bold mb-8 capitalize">{contentType}</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 