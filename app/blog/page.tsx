import { getAllPosts } from '../lib/mdx';
import { BlogCard } from '../components/BlogCard';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
} 