import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import moment from 'moment';

const contentDirectory = path.join(process.cwd(), 'content');

export type ContentType = {
  name: string;
  path: string;
  order: number;
  nav?: boolean;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  contentType: string;
  show_dates?: boolean;
  tags?: string[];
};

export function getContentTypes({ filterNav = false }: { filterNav?: boolean } = {}): ContentType[] {
  let contentTypes = fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const typeName = dirent.name;
      const indexPath = path.join(contentDirectory, typeName, '_index.mdx');
      let order = 999; // Default high order for types without _index.mdx
      let nav = false; // Default to showing in nav

      // Check if _index.mdx exists and read its frontmatter
      if (fs.existsSync(indexPath)) {
        try {
          const fileContents = fs.readFileSync(indexPath, 'utf8');
          const { data } = matter(fileContents);
          if (data.order !== undefined) {
            order = data.order;
          }
          if (data.nav !== undefined) {
            nav = data.nav;
          }
        } catch (error) {
          console.error(`Error reading _index.mdx for ${typeName}:`, error);
        }
      }
      return {
        name: typeName,
        path: `/content/${typeName}`,
        order,
        nav
      };
    });
  if (filterNav) {
    contentTypes = contentTypes.filter(type => type.nav !== false);
  }

  // Sort content types by order
  return contentTypes.sort((a, b) => a.order - b.order);
}

export function getAllPosts(contentType?: string, tag?: string): Post[] {
  const contentTypes = contentType ? [contentType] : getContentTypes().map(type => type.name);
  const allPostsData: Post[] = [];

  for (const type of contentTypes) {
    const typeDirectory = path.join(contentDirectory, type);
    if (!fs.existsSync(typeDirectory)) continue;

    // Check if _index.mdx exists and read its frontmatter for show_in_recent and show_dates
    const indexPath = path.join(typeDirectory, '_index.mdx');
    let showInRecent = true; // Default to showing in recent
    let showDates = true; // Default to showing dates

    if (fs.existsSync(indexPath)) {
      try {
        const fileContents = fs.readFileSync(indexPath, 'utf8');
        const { data } = matter(fileContents);
        if (data.show_in_recent !== undefined) {
          showInRecent = data.show_in_recent;
        }
        if (data.show_dates !== undefined) {
          showDates = data.show_dates;
        }
      } catch (error) {
        console.error(`Error reading _index.mdx for ${type}:`, error);
      }
    }

    // Skip this content type if show_in_recent is false
    if (!showInRecent) continue;

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
          contentType: type,
          show_dates: showDates,
          tags: data.tags || []
        };
      });

    allPostsData.push(...typePosts);
  }

  let filteredPosts = allPostsData;
  if (tag) {
    const lowercaseTag = tag.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.tags?.some(t => t.toLowerCase() === lowercaseTag)
    );
  }

  const sortedPosts = filteredPosts.sort((a, b) => moment.utc(b.date).diff(moment.utc(a.date)));
  return sortedPosts;
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