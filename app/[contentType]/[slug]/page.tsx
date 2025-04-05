import { getPostBySlug, getContentTypes, getAllPosts } from '../../lib/mdx';
import { notFound } from 'next/navigation';
import { MDXProvider } from '../../components/mdx/MDXProvider';
import { ContentBreadcrumb } from '../../components/ContentBreadcrumb';

export async function generateStaticParams() {
  const contentTypes = getContentTypes();
  const params = [];

  for (const type of contentTypes) {
    const posts = getAllPosts(type.name);
    for (const post of posts) {
      params.push({
        contentType: type.name,
        slug: post.slug,
      });
    }
  }

  return params;
}

type PageProps = {
  params: Promise<{ contentType: string; slug: string }>;
};

export default async function ContentPage({ params }: PageProps) {
  const { contentType, slug } = await params;
  const post = getPostBySlug(slug, contentType);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} post={post} />
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <time className="text-gray-500">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>
      <div className="prose prose-lg max-w-none">
        <MDXProvider source={post.content} />
      </div>
    </article>
  );
} 