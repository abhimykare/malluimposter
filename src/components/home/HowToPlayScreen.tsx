import { I18nText } from "@/components/i18n/I18nText";
import { CreatorFooter } from "@/components/layout/CreatorFooter";
import { BackButton } from "@/components/ui/BackButton";
import { LinkButton } from "@/components/ui/Button";
import { PlayIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import type { TranslationKey } from "@/data/translations";
import { cn } from "@/lib/cn";

type Rule = { title: TranslationKey; body: TranslationKey; emoji: string; tone?: "imposter" | "word" };

const RULES: Rule[] = [
  { title: "rule1Title", body: "rule1Body", emoji: "👥" },
  { title: "rule2Title", body: "rule2Body", emoji: "🗂️" },
  { title: "rule3Title", body: "rule3Body", emoji: "📱" },
  { title: "rule4Title", body: "rule4Body", emoji: "🔑", tone: "word" },
  { title: "rule5Title", body: "rule5Body", emoji: "🕵️", tone: "imposter" },
  { title: "rule6Title", body: "rule6Body", emoji: "💬" },
  { title: "rule7Title", body: "rule7Body", emoji: "🗳️" },
  { title: "rule8Title", body: "rule8Body", emoji: "🏆" },
];

/** Static, server-rendered rules screen (bilingual via I18nText). */
export function HowToPlayScreen() {
  return (
    <Screen width="wide" withBottomBar>
      <header className="mb-2 flex h-14 items-center">
        <BackButton href="/" />
      </header>
      <div className="animate-fade-up px-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          <I18nText k="rulesTitle" />
        </h1>
        <p className="mt-1.5 text-muted text-pretty">
          <I18nText k="rulesIntro" />
        </p>
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-2">
        {RULES.map((rule, i) => (
          <li
            key={rule.title}
            className={cn(
              "surface-card animate-fade-up flex gap-3.5 rounded-lg p-4",
              rule.tone === "imposter" && "ring-1 ring-inset ring-imposter/40",
              rule.tone === "word" && "ring-1 ring-inset ring-word/40",
            )}
            style={{ animationDelay: `${40 * (i + 1)}ms` }}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-md text-2xl",
                rule.tone === "imposter" ? "bg-imposter-soft" : rule.tone === "word" ? "bg-word-soft" : "bg-surface-2",
              )}
            >
              {rule.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold text-fg">
                <span className="mr-1.5 text-faint tabular">{i + 1}.</span>
                <I18nText k={rule.title} />
              </h2>
              <p className="mt-0.5 text-sm text-muted text-pretty">
                <I18nText k={rule.body} />
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 rounded-lg bg-accent-soft px-4 py-3 text-sm font-medium text-fg/90 text-pretty">
        💡 <I18nText k="rulesTip" />
      </p>

      <CreatorFooter className="mt-6" />

      <BottomBar width="wide">
        <LinkButton href="/game" size="lg" fullWidth leadingIcon={<PlayIcon size={20} />} className="sm:mx-auto sm:max-w-md">
          <I18nText k="startGame" />
        </LinkButton>
      </BottomBar>
    </Screen>
  );
}
