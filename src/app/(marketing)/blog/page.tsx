import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Stuttering Blog - Tips, Research & Exercises",
  description:
    "Expert articles on stuttering treatment, speech therapy exercises, research updates, and tips for building fluency. Written with SLP guidance.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Stuttering Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Evidence-based articles on stuttering treatment, exercises, and
            research — written with guidance from Speech-Language Pathologists.
          </p>
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Blog posts coming soon. Check back for articles on stuttering
                treatment, exercises, and research.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full border-border/60 hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted mb-3"
                      >
                        {post.category}
                      </Badge>
                      <h2 className="font-semibold text-lg leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {post.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
