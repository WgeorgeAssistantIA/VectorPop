import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { posts, type BlogPost } from "@/lib/blog-posts";

export const Route = createFileRoute("/vectofix/blog")({
  head: () => ({
    meta: [
      { title: "Blog — VectoFix" },
      {
        name: "description",
        content: "Guides on vector repair, SVG fidelity, and getting a clean vector out of a damaged trace, from the VectoFix team.",
      },
      { property: "og:title", content: "Blog — VectoFix" },
      { property: "og:url", content: "https://vectorpop.fr/vectofix/blog" },
    ],
    links: [{ rel: "canonical", href: "https://vectorpop.fr/vectofix/blog" }],
  }),
  component: VectoFixBlogIndex,
});

const byDateDesc = (a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date);

function PostCard({ post }: { post: BlogPost }) {
  const fr = post.lang === "fr";
  return (
    <li>
      <Link
        to="/vectofix/blog/$slug"
        params={{ slug: post.slug }}
        className="block rounded-xl border border-border/60 bg-card p-6 transition hover:border-[#2563eb]/60 hover:bg-card/80"
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <time>
            {new Date(post.date).toLocaleDateString(fr ? "fr-FR" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readingTime} {fr ? "min de lecture" : "min read"}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{post.title}</h2>
        <p className="mt-2 text-muted-foreground">{post.description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#60a5fa]">
          {fr ? "Lire l'article" : "Read article"} <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </li>
  );
}

function VectoFixBlogIndex() {
  const vfPosts = posts.filter((p) => p.app === "vectofix");
  const frPosts = vfPosts.filter((p) => p.lang === "fr").sort(byDateDesc);
  const enPosts = vfPosts.filter((p) => p.lang === "en").sort(byDateDesc);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          to="/vectofix"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to VectoFix
        </Link>

        <header className="mt-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">VectoFix Blog</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Guides on vector repair, fidelity, and getting a clean SVG out of a damaged trace.
          </p>
        </header>

        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            In English
          </h2>
          <ul className="space-y-6">
            {enPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            En français
          </h2>
          <ul className="space-y-6">
            {frPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
