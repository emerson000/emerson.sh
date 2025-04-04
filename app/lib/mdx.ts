import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export type Post = {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
};

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => {
      return fileName.endsWith('.mdx');
    })
    .map((fileName) => {
      const defaultSlug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: data.slug || defaultSlug,
        title: data.title,
        date: data.date,
        content,
        excerpt: data.excerpt,
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const posts = getAllPosts();
    const post = posts.find((p) => p.slug === slug);
    
    if (!post) {
      return null;
    }

    return post;
  } catch (e) {
    console.error(e);
    return null;
  }
} 