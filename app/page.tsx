import { BlogCard } from './components/BlogCard';
import { getAllPosts } from './lib/mdx';

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 6); // Get 6 most recent posts

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <section>
          <h1 className="text-4xl font-bold mb-8">Recent Posts</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
