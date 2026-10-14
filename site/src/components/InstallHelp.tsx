import { ShieldCheck, X } from "lucide-react";

type Lang = "en" | "fr";

const copy = {
  fr: {
    title: "Téléchargement lancé — encore 2 clics pour installer",
    edge: [
      "Si votre navigateur indique « n'est pas couramment téléchargé » : ouvrez les téléchargements, cliquez sur",
      "« … » → « Conserver », puis « Afficher plus » → « Conserver quand même ».",
    ],
    windows: [
      "Au lancement, si Windows affiche « Windows a protégé votre ordinateur » : cliquez sur",
      "« Informations complémentaires » → « Exécuter quand même ».",
    ],
    why: "L'installeur est sûr : il est simplement encore trop récent pour être reconnu par Microsoft.",
    store: "Installer sans avertissement depuis le Microsoft Store",
    close: "Fermer",
  },
  en: {
    title: "Download started — 2 more clicks to install",
    edge: [
      "If your browser says the file “isn't commonly downloaded”: open your downloads, click",
      "“…” → “Keep”, then “Show more” → “Keep anyway”.",
    ],
    windows: [
      "When you launch it, if Windows shows “Windows protected your PC”: click",
      "“More info” → “Run anyway”.",
    ],
    why: "The installer is safe — it's simply too new to be recognised by Microsoft yet.",
    store: "Install without any warning from the Microsoft Store",
    close: "Close",
  },
} as const;

/**
 * Shown right after a click on the Windows .exe button: the installer isn't code-signed,
 * so Edge/Chrome and SmartScreen warn at exactly that moment — a hover tooltip was gone by then.
 */
export function InstallHelp({
  lang,
  storeUrl,
  onClose,
}: {
  lang: Lang;
  storeUrl?: string;
  onClose: () => void;
}) {
  const c = copy[lang];
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-xl border border-primary/40 bg-background/95 p-4 pr-10 text-left text-sm leading-relaxed shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 sm:bottom-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={c.close}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> {c.title}
      </p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
        <li>
          {c.edge[0]} <strong className="text-foreground">{c.edge[1]}</strong>
        </li>
        <li>
          {c.windows[0]} <strong className="text-foreground">{c.windows[1]}</strong>
        </li>
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">{c.why}</p>
      {storeUrl && (
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-primary underline underline-offset-2"
        >
          {c.store} →
        </a>
      )}
    </div>
  );
}
