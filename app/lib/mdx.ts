import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export type ContentType = {
  name: string;
  path: string;
  order: number;
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
    .map(dirent => {
      const typeName = dirent.name;
      const indexPath = path.join(contentDirectory, typeName, '_index.mdx');
      let order = 999; // Default high order for types without _index.mdx
      
      // Check if _index.mdx exists and read its frontmatter
      if (fs.existsSync(indexPath)) {
        try {
          const fileContents = fs.readFileSync(indexPath, 'utf8');
          const { data } = matter(fileContents);
          if (data.order !== undefined) {
            order = data.order;
          }
        } catch (error) {
          console.error(`Error reading _index.mdx for ${typeName}:`, error);
        }
      }
      
      return {
        name: typeName,
        path: `/content/${typeName}`,
        order
      };
    });
  
  // Sort content types by order
  return contentTypes.sort((a, b) => a.order - b.order);
}

export function getAllPosts(contentType?: string): Post[] {
  const contentTypes = contentType ? [contentType] : getContentTypes().map(type => type.name);
  const allPostsData: Post[] = [];

  for (const type of contentTypes) {
    const typeDirectory = path.join(contentDirectory, type);
    if (!fs.existsSync(typeDirectory)) continue;

    const fileNames = fs.readdirSync(typeDirectory);
    const typePosts = fileNames
      .filter((fileName) => fileName.endsWith('.mdx') && fileName !== '_index.mdx')
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