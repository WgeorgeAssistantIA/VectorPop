import type { ReactNode } from "react";

// Liens : [ancre](/chemin) (interne) ou [ancre](https://...) (externe, nouvel onglet) -> <a>.
export function renderInline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\((?:\/|https:\/\/)[^)]*\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(((?:\/|https:\/\/)[^)]*)\)$/);
    if (!m) return part;
    const external = m[2].startsWith("https://");
    return (
      <a
        key={i}
        href={m[2]}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {m[1]}
      </a>
    );
  });
}
