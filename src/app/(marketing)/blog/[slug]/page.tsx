import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/marketing/cta-section";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { createMetadata, jsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
  });
}

const mdxComponents = {
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="text-2xl font-bold mt-8 mb-3" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4"
      {...props}
    />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          publisher: {
            "@type": "Organization",
            name: "StutterLab",
          },
        })}
      />

      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Link>
          </Button>

          {/* Header */}
          <Badge variant="secondary" className="text-xs bg-muted mb-3">
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>

          {/* Content */}
          <div className="mt-10">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>

      <CtaSection
        title="Ready to Practice?"
        description="Start your evidence-based stuttering training with StutterLab. Free to begin."
      />
    </>
  );
}
