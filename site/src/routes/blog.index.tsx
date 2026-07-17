import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { posts } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — VectorPop" },
      {
        name: "description",
        content:
          "Guides and tutorials on vectorization, SVG, and preparing logos for print, from the VectorPop team.",
      },
      { property: "og:title", content: "Blog — VectorPop" },
      {
        property: "og:description",
        content: "Vectorization and SVG tutorials from the VectorPop team.",
      },
      { property: "og:url", content: "https://vectorpop.fr/blog" },
    ],
    links: [
      { rel: "canonical", href: "https://vectorpop.fr/blog" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <header className="mt-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Guides on vectorization, SVG, and getting your logo print-ready.
          </p>
        </header>

        <ul className="space-y-6">
          {[...posts]
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
            .map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="block rounded-xl border border-border/60 bg-card p-6 transition hover:border-primary/60 hover:bg-card/80"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time>{new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.readingTime} min read
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{p.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read article <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
