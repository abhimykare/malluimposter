import { Logo, Wordmark } from "@/components/brand/Logo";
import { I18nText } from "@/components/i18n/I18nText";
import { CreatorFooter } from "@/components/layout/CreatorFooter";
import { PhoneIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/Screen";
import { APP_NAME } from "@/lib/site";

import { HomeActions } from "./HomeActions";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Home is a server component: the hero paints in the first HTML response, in
 * the user's language (via <html lang> + CSS), with a CSS-only entrance.
 * Only the small interactive islands hydrate.
 */
export function HomeScreen() {
  return (
    <Screen width="default">
      <div className="flex h-14 items-center justify-end">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="animate-fade-up flex flex-col items-center gap-4">
          <Logo size={84} title={APP_NAME} className="drop-shadow-[0_12px_30px_rgba(255,182,39,0.25)]" />
          <h1 className="sr-only">{APP_NAME}</h1>
          <Wordmark className="text-4xl leading-none sm:text-5xl" />
        </div>

        <p
          className="animate-fade-up mt-7 max-w-[22ch] font-display text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-balance text-fg sm:text-[2.1rem]"
          style={{ animationDelay: "60ms" }}
        >
          <span className="block">
            <I18nText k="taglineLine1" />
          </span>
          <span className="block">
            <I18nText k="taglineLine2" />
          </span>
          <span className="block text-accent">
            <I18nText k="taglineLine3" />
          </span>
        </p>

        <div className="animate-fade-up mt-9 flex w-full justify-center" style={{ animationDelay: "120ms" }}>
          <HomeActions />
        </div>

        <div className="animate-fade-up mt-8 w-full max-w-sm" style={{ animationDelay: "180ms" }}>
          <LanguageSwitcher />
        </div>

        <ul
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-muted"
          style={{ animationDelay: "240ms" }}
        >
          <li className="flex items-center gap-1.5">
            <PhoneIcon size={16} className="text-accent" />
            <I18nText k="homePassPhone" />
          </li>
          <li className="flex items-center gap-1.5">
            <UsersIcon size={16} className="text-accent" />
            <I18nText k="homePlayers" />
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldIcon size={16} className="text-accent" />
            <I18nText k="offlineReady" />
          </li>
        </ul>
      </div>

      <p className="text-center text-xs text-faint text-pretty">
        <I18nText k="homePrivacyNote" />
      </p>
      <CreatorFooter className="mt-2" />
    </Screen>
  );
}
