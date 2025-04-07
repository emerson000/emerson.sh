import { cn } from '@/lib/utils';
import { BlogCard } from './components/BlogCard';
import { getAllPosts } from './lib/mdx';
import { logoFont } from './components/Logo';
import { TypewriterText } from './components/TypewriterText';
import { CodeBlock } from './components/mdx/CodeBlock';

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 6); // Get 6 most recent posts

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <section className="flex flex-col items-center justify-center mb-8">
          <p className={cn(logoFont.className, "text-4xl font-bold text-slate-700", "dark:text-slate-200")}>
            <TypewriterText text="Trust, but verify" />
          </p>
        </section>
        <section className="mb-8">
          <CodeBlock language="bash">
            {`$ whoami
root
$ cd /home/emerson
$ rm -rf ./*
$ rm ~/.bash_history
`}
          </CodeBlock>
        </section>
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Recent</h1>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
