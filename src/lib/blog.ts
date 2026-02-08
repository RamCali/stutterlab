import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: string;
  content: string;
  published: boolean;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
    .filter((post): post is BlogPost => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "StutterLab Team",
    category: data.category || "General",
    tags: data.tags || [],
    readingTime: stats.text,
    content,
    published: data.published !== false,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  return [...new Set(posts.map((p) => p.category))];
}
