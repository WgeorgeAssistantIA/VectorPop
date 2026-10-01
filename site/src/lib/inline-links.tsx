import type { ReactNode } from "react";

// Liens internes : [ancre](/chemin) dans les textes de blog -> <a>.
export function renderInline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\(\/[^)]*\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
    if (!m) return part;
    return (
      <a key={i} href={m[2]} className="text-primary underline underline-offset-2 hover:text-primary/80">
        {m[1]}
      </a>
    );
  });
}
