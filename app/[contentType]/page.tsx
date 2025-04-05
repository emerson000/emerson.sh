import { getAllPosts, getContentTypes } from '../lib/mdx';
import { BlogCard } from '../components/BlogCard';
import { ContentBreadcrumb } from '../components/ContentBreadcrumb';
import { notFound } from 'next/navigation';

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} />
      <h1 className="text-4xl font-bold mb-8 capitalize">{contentType}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 