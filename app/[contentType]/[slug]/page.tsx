import { getPostBySlug, getContentTypes, getAllPosts } from '../../lib/mdx';
import { notFound } from 'next/navigation';
import { MDXProvider } from '../../components/mdx/MDXProvider';
import { ContentBreadcrumb } from '../../components/ContentBreadcrumb';
import { Metadata } from 'next';

// Function to extract image URLs from MDX content
function extractImagesFromMDX(content: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const matches = [...content.matchAll(imageRegex)];
  return matches.map(match => match[1]);
}

export async function generateMetadata({ params }: { params: Promise<{ contentType: string; slug: string }> }): Promise<Metadata> {
  const { contentType, slug } = await params;
  const post = getPostBySlug(slug, contentType);
  
  if (!post) {
    return {
      title: 'Not Found',
    };
  }

  const images = extractImagesFromMDX(post.content);
  
  return {
    title: `${post.title} | ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    description: post.excerpt || `Read about ${post.title} in our ${contentType} section`,
    openGraph: {
      images: images.map(src => ({
        url: src.startsWith('http') ? src : `/${src.startsWith('/') ? src.slice(1) : src}`,
        alt: post.title,
      })),
    },
  };
}

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
        {post.show_dates !== false && (
          <time className="text-gray-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </header>
      <div className="prose prose-lg max-w-none">
        <MDXProvider source={post.content} />
      </div>
    </article>
  );
} 