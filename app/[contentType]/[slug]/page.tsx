import { getPostBySlug, getContentTypes, getAllPosts } from '../../lib/mdx';
import { notFound } from 'next/navigation';
import { MDXProvider } from '@/app/components/mdx/MDXProvider';
import { ContentBreadcrumb } from '@/app/components/ContentBreadcrumb';
import { Metadata } from 'next';
import { TagBadge } from '@/app/components/TagBadge';
// Function to extract image URLs from MDX content
function extractImagesFromMDX(content: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const matches = [...content.matchAll(imageRegex)];
  return matches.map(match => match[1]);
}

export async function generateMetadata({ params }: { params: Promise<{ contentType: string; slug: string }> }): Promise<Metadata> {
  const { contentType, slug } = await params;
  
  // Handle the empty content type and slug case
  if (contentType === 'empty' && slug === 'empty') {
    return {
      title: 'No Content Available | emerson',
      description: 'No content is available at this time.',
    };
  }
  
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
        slug: post.slug
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
  
  // Handle the empty content type and slug case
  if (contentType === 'empty' && slug === 'empty') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
        <p className="text-lg mb-4">There is no content available at this time.</p>
        <p>Please add content to see it displayed here.</p>
      </div>
    );
  }
  
  const contentTypes = getContentTypes();
  const contentTypeExists = contentTypes.some(type => type.name === contentType);
  
  if (!contentTypeExists) {
    notFound();
  }
  
  const post = getPostBySlug(slug, contentType);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <ContentBreadcrumb contentType={contentType} post={post} />
      <header className="mb-8 flex justify-between items-end">
        <div>
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
        </div>
        <div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} contentType={contentType} />
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="prose prose-lg max-w-none bg-muted dark:bg-zinc-900 p-6 rounded-2xl shadow-md border text-foreground">
        <MDXProvider source={post.content} />
      </div>
    </article>
  );
} 