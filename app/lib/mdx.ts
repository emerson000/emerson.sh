import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export type ContentType = {
  name: string;
  path: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  contentType: string;
};

export function getContentTypes(): ContentType[] {
  const contentTypes = fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      name: dirent.name,
      path: `/content/${dirent.name}`
    }));
  
  return contentTypes;
}

export function getAllPosts(contentType?: string): Post[] {
  const contentTypes = contentType ? [contentType] : getContentTypes().map(type => type.name);
  const allPostsData: Post[] = [];

  for (const type of contentTypes) {
    const typeDirectory = path.join(contentDirectory, type);
    if (!fs.existsSync(typeDirectory)) continue;

    const fileNames = fs.readdirSync(typeDirectory);
    const typePosts = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const defaultSlug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(typeDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug: data.slug || defaultSlug,
          title: data.title,
          date: data.date,
          content,
          excerpt: data.excerpt,
          contentType: type
        };
      });

    allPostsData.push(...typePosts);
  }

  return allPostsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getPostBySlug(slug: string, contentType?: string): Post | null {
  try {
    const posts = getAllPosts(contentType);
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