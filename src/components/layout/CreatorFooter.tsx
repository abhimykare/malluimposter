import { I18nText } from "@/components/i18n/I18nText";
import { cn } from "@/lib/cn";

const CREATOR_NAME = "ARK";
const CREATOR_URL = "https://abhirajk.vercel.app/";

/** Small creator credit shown at the bottom of the static pages. */
export function CreatorFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("pb-1 text-center text-xs text-faint", className)}>
      <I18nText k="developedBy" />{" "}
      <a
        href={CREATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:text-accent"
      >
        {CREATOR_NAME}
      </a>
    </footer>
  );
}
