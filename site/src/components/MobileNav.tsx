import { type ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Hamburger menu for screens below `md`, where the header's inline nav is hidden.
 * Must sit inside the sticky header: the panel is positioned against it.
 */
export function MobileNav({ children, label = "Menu" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <nav
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-background px-6 py-2 text-base text-muted-foreground shadow-lg [&>*]:border-b [&>*]:border-border/50 [&>*]:py-3 [&>*:last-child]:border-0 [&>*:hover]:text-foreground"
        >
          {children}
        </nav>
      )}
    </div>
  );
}
