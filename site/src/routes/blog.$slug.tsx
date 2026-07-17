import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, ArrowLeft, Download } from "lucide-react";
import { getPost, posts, type BlogPost as BlogPostType } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Article — VectorPop" }] };
    const canonical = `https://vectorpop.fr/blog/${post.slug}`;
    return {
      meta: [
        { title: `${post.title} — VectorPop Blog` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "article:author", content: post.author },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            author: { "@type": "Organization", name: post.author },
            publisher: {
              "@type": "Organization",
              name: "VectorPop",
              logo: {
                "@type": "ImageObject",
                url: "https://vectorpop.fr/vectorpop_logo.png",
              },
            },
            image: "https://vectorpop.fr/og.png",
            mainEntityOfPage: canonical,
            url: canonical,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This article doesn't exist or has been moved.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    </main>
  ),
  errorComponent: ({ error, reset }) => (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Try again
        </button>
      </div>
    </main>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData() as { post: BlogPostType };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <header className="mt-8 mb-10">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <time>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
            </span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
        </header>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          {post.content.map((block, i) => {
            if (block.type === "h2")
              return (
                <h2 key={i} className="mt-10 text-2xl font-semibold tracking-tight text-foreground">
                  {block.text}
                </h2>
              );
            if (block.type === "p")
              return (
                <p key={i} className="text-base md:text-lg">
                  {block.text}
                </p>
              );
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 text-base md:text-lg marker:text-primary">
                {block.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8 text-center">
          <h3 className="text-2xl font-bold">Got a logo stuck in a PNG?</h3>
          <p className="mt-2 text-muted-foreground">
            Try VectorPop free and turn it into a clean, editable SVG — on your own machine.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Get VectorPop
          </Link>
        </div>

        {posts.length > 1 && (
          <div className="mt-16 border-t border-border/60 pt-8">
            <Link to="/blog" className="text-sm text-primary hover:underline">
              ← Read more articles
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}
