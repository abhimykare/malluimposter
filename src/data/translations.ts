import type { Language } from "./types";

/**
 * All UI copy lives here. Keys are typed from the English source; the
 * Malayalam object must satisfy the same shape, so a missing Malayalam string
 * is a compile-time error — we never silently ship an English fallback.
 *
 * Placeholders use {name} syntax and are interpolated by `t()`.
 */

const en = {
  // Brand
  appName: "MalluImposter",
  tagline: "One word. One imposter. Can you find them?",
  taglineLine1: "One word.",
  taglineLine2: "One imposter.",
  taglineLine3: "Can you find them?",

  // Common actions
  startGame: "Start Game",
  howToPlay: "How to Play",
  back: "Back",
  home: "Home",
  continue: "Continue",
  close: "Close",
  gotIt: "Got it",
  on: "On",
  off: "Off",
  language: "Language",
  theme: "Theme",
  themeDark: "Dark",
  themeLight: "Light",
  themeSystem: "Auto",
  switchToLight: "Switch to light theme",
  switchToDark: "Switch to dark theme",
  menu: "Menu",
  settings: "Settings",

  // Home
  homePrivacyNote: "No sign-up. No internet needed. Everything stays on this phone.",
  homePassPhone: "Pass one phone around",
  homePlayers: "3–20 players",
  homeMinutes: "5-minute rounds",

  // Setup
  setupTitle: "Set up your game",
  setupSubtitle: "Tune the round, then pass the phone around.",
  players: "Players",
  playersHint: "Everyone plays on this one phone.",
  playerNames: "Player names",
  playerNamesHint: "Optional. Leave blank to use Player 1, 2, 3…",
  nameFor: "Name for {player}",
  clearNames: "Clear all names",
  imposterIsRandom: "The Imposter is picked at random every round.",
  fewerPlayers: "Fewer players",
  morePlayers: "More players",
  categories: "Categories",
  categoriesHint: "Pick one or many. Words come only from these.",
  allCategories: "All",
  categoriesSelectedCount: "{count} selected",
  wordsAvailable: "{count} words",
  imposterClue: "Imposter clue",
  imposterClueHint: "The imposter gets a subtle hint so they can bluff.",
  discussionTimer: "Discussion timer",
  discussionTimerHint: "Count down the discussion before voting.",
  minutesShort: "{n} min",
  minutesLong: "{n} minutes",
  selectAtLeastOneCategory: "Pick at least one category to start.",
  noWordsForSelection: "No words available for this selection.",
  startRound: "Start Round",
  roundReady: "Ready to play",

  // Reveal
  playerN: "Player {n}",
  passPhoneTo: "Pass the phone to {player}.",
  makeSureNobodyLooking: "Make sure nobody else is looking.",
  revealMyRole: "Reveal My Role",
  tapToReveal: "Tap to reveal",
  tapToRevealHint: "Only you should see this.",
  yourWord: "Your word",
  youAreTheImposter: "You are the Imposter",
  clue: "Clue",
  imposterNoClue: "You don't know the word. Blend in.",
  imposterWithClue: "Use the clue. Don't get caught.",
  dontSayWord: "Don't say the word out loud.",
  hideAndPass: "Hide & Pass",
  hideRole: "Hide Role",
  revealProgress: "{current} of {total}",
  rolesHiddenAgain: "Role hidden. Pass the phone.",
  everyoneReady: "Everyone knows their role.",
  startDiscussion: "Start Discussion",

  // Starter pick
  whoStarts: "Who starts?",
  pickingStarter: "Picking someone at random…",
  starterChosen: "{player} starts!",
  starterGoesFirst: "{player} goes first",
  starterHint: "Then go around the circle.",

  // Discussion
  discussionTitle: "Now discuss.",
  discussionBody: "Give clues. Ask questions. Find the Imposter.",
  discussionTip: "Never say the secret word out loud.",
  startVoting: "Start Voting",
  timerRunning: "Discussion timer",
  timerPaused: "Paused",
  timeUp: "Time's up!",
  pause: "Pause timer",
  resume: "Resume timer",
  restartTimer: "Restart timer",
  skipTimer: "Skip timer",

  // Voting
  whoIsTheImposter: "Who is the Imposter?",
  votingHint: "Tap the player you suspect, then reveal.",
  revealResult: "Reveal Result",
  selected: "Selected",
  votedFor: "You voted for {player}.",

  // Result
  imposter: "Imposter",
  theImposterWas: "The Imposter was…",
  theWordWas: "The word was…",
  secretWord: "Secret word",
  imposterClueLabel: "Imposter clue",
  groupWon: "The Group Won",
  imposterWon: "The Imposter Won",
  groupWonBody: "You caught {player}.",
  imposterWonBody: "{voted} was innocent. {imposter} got away.",
  playAgain: "Play Again",
  changeSettings: "Change Settings",
  tapToContinue: "Tap to continue",
  skipAhead: "Skip",
  roundOver: "Round over",

  // How to play
  rulesTitle: "How to Play",
  rulesIntro: "A party game for one phone and a room full of suspicious friends.",
  rule1Title: "Choose your players",
  rule1Body: "Set how many people are playing. Everyone passes one phone around.",
  rule2Title: "Pick your categories",
  rule2Body: "Food, animals, household things and more — choose one or mix them.",
  rule3Title: "Everyone checks their role",
  rule3Body: "One by one, each player secretly reveals their card and hides it again.",
  rule4Title: "Everyone sees the secret word",
  rule4Body: "Everyone except the Imposter, that is.",
  rule5Title: "The Imposter gets a subtle clue",
  rule5Body: "Only if 'Imposter clue' is on. It's vague on purpose.",
  rule6Title: "Discuss and give clues",
  rule6Body: "Describe the word without saying it. Watch who sounds unsure.",
  rule7Title: "Vote",
  rule7Body: "Point at the player you think is bluffing.",
  rule8Title: "Find the Imposter",
  rule8Body: "Catch them before they figure out the word — or they win.",
  rulesTip: "Tip: keep your clues clever, not obvious. Too clear and the Imposter learns the word.",

  // Leaving a round
  leaveRoundTitle: "Leave this round?",
  leaveRoundBody: "The secret word and everyone's roles will be lost.",
  leave: "Leave",
  stay: "Stay",
  exitToHome: "Exit to home",

  // Errors / misc
  errorTitle: "Something went wrong",
  errorBody: "Head home and start a fresh round.",
  roundLost: "That round is over. Start a new one.",
  retry: "Try again",
  offlineReady: "Ready to play offline",
  installApp: "Install app",
  playerCount: "Player count",
  categoryPicker: "Category picker",
  currentlySelected: "Currently selected",
  notSelected: "Not selected",
} as const;

export type TranslationKey = keyof typeof en;
export type Translation = Record<TranslationKey, string>;

const ml: Translation = {
  // Brand
  appName: "MalluImposter",
  tagline: "ഒരു വാക്ക്. ഒരു ഇമ്പോസ്റ്റർ. കണ്ടുപിടിക്കാമോ?",
  taglineLine1: "ഒരു വാക്ക്.",
  taglineLine2: "ഒരു ഇമ്പോസ്റ്റർ.",
  taglineLine3: "കണ്ടുപിടിക്കാമോ?",

  // Common actions
  startGame: "കളി തുടങ്ങാം",
  howToPlay: "എങ്ങനെ കളിക്കാം",
  back: "തിരികെ",
  home: "ഹോം",
  continue: "തുടരാം",
  close: "അടയ്ക്കൂ",
  gotIt: "മനസ്സിലായി",
  on: "ഓൺ",
  off: "ഓഫ്",
  language: "ഭാഷ",
  theme: "തീം",
  themeDark: "ഡാർക്ക്",
  themeLight: "ലൈറ്റ്",
  themeSystem: "ഓട്ടോ",
  switchToLight: "ലൈറ്റ് തീമിലേക്ക് മാറ്റൂ",
  switchToDark: "ഡാർക്ക് തീമിലേക്ക് മാറ്റൂ",
  menu: "മെനു",
  settings: "ക്രമീകരണങ്ങൾ",

  // Home
  homePrivacyNote: "ലോഗിൻ വേണ്ട. ഇന്റർനെറ്റ് വേണ്ട. എല്ലാം ഈ ഫോണിൽ തന്നെ.",
  homePassPhone: "ഒരു ഫോൺ കൈമാറി കളിക്കാം",
  homePlayers: "3–20 കളിക്കാർ",
  homeMinutes: "5 മിനിറ്റ് റൗണ്ടുകൾ",

  // Setup
  setupTitle: "കളി സജ്ജമാക്കാം",
  setupSubtitle: "റൗണ്ട് ക്രമീകരിച്ച് ഫോൺ കൈമാറൂ.",
  players: "കളിക്കാർ",
  playersHint: "എല്ലാവരും ഈ ഒരു ഫോണിൽ കളിക്കുന്നു.",
  playerNames: "കളിക്കാരുടെ പേരുകൾ",
  playerNamesHint: "ഐച്ഛികം. ഒഴിച്ചിട്ടാൽ പ്ലെയർ 1, 2, 3… എന്നാകും.",
  nameFor: "{player}-ന്റെ പേര്",
  clearNames: "എല്ലാ പേരുകളും മായ്ക്കൂ",
  imposterIsRandom: "ഓരോ റൗണ്ടിലും ഇമ്പോസ്റ്ററെ യാദൃച്ഛികമായാണ് തിരഞ്ഞെടുക്കുന്നത്.",
  fewerPlayers: "കളിക്കാരെ കുറയ്ക്കുക",
  morePlayers: "കളിക്കാരെ കൂട്ടുക",
  categories: "വിഭാഗങ്ങൾ",
  categoriesHint: "ഒന്നോ പലതോ തിരഞ്ഞെടുക്കൂ. വാക്കുകൾ ഇവയിൽ നിന്ന് മാത്രം.",
  allCategories: "എല്ലാം",
  categoriesSelectedCount: "{count} തിരഞ്ഞെടുത്തു",
  wordsAvailable: "{count} വാക്കുകൾ",
  imposterClue: "ഇമ്പോസ്റ്റർ സൂചന",
  imposterClueHint: "ഇമ്പോസ്റ്റർക്ക് ഒരു ചെറിയ സൂചന കിട്ടും.",
  discussionTimer: "ചർച്ചാ ടൈമർ",
  discussionTimerHint: "വോട്ടിംഗിന് മുമ്പ് ചർച്ചയ്ക്ക് സമയപരിധി.",
  minutesShort: "{n} മിനിറ്റ്",
  minutesLong: "{n} മിനിറ്റ്",
  selectAtLeastOneCategory: "തുടങ്ങാൻ ഒരു വിഭാഗമെങ്കിലും തിരഞ്ഞെടുക്കൂ.",
  noWordsForSelection: "ഈ തിരഞ്ഞെടുപ്പിന് വാക്കുകളൊന്നുമില്ല.",
  startRound: "റൗണ്ട് തുടങ്ങാം",
  roundReady: "കളിക്കാൻ തയ്യാർ",

  // Reveal
  playerN: "പ്ലെയർ {n}",
  passPhoneTo: "ഫോൺ {player}-ന് കൈമാറൂ.",
  makeSureNobodyLooking: "മറ്റാരും നോക്കുന്നില്ലെന്ന് ഉറപ്പാക്കൂ.",
  revealMyRole: "എന്റെ റോൾ കാണിക്കൂ",
  tapToReveal: "കാണാൻ ടാപ്പ് ചെയ്യൂ",
  tapToRevealHint: "ഇത് നിങ്ങൾ മാത്രം കാണണം.",
  yourWord: "നിങ്ങളുടെ വാക്ക്",
  youAreTheImposter: "നിങ്ങളാണ് ഇമ്പോസ്റ്റർ",
  clue: "സൂചന",
  imposterNoClue: "വാക്ക് നിങ്ങൾക്കറിയില്ല. സംശയം തോന്നിക്കാതെ കളിക്കൂ.",
  imposterWithClue: "സൂചന ഉപയോഗിക്കൂ. പിടിക്കപ്പെടരുത്.",
  dontSayWord: "വാക്ക് ഉറക്കെ പറയരുത്.",
  hideAndPass: "മറച്ച് കൈമാറൂ",
  hideRole: "റോൾ മറയ്ക്കൂ",
  revealProgress: "{current} / {total}",
  rolesHiddenAgain: "റോൾ മറച്ചു. ഫോൺ കൈമാറൂ.",
  everyoneReady: "എല്ലാവരും റോൾ കണ്ടു.",
  startDiscussion: "ചർച്ച തുടങ്ങാം",

  // Starter pick
  whoStarts: "ആര് തുടങ്ങും?",
  pickingStarter: "ഒരാളെ യാദൃച്ഛികമായി തിരഞ്ഞെടുക്കുന്നു…",
  starterChosen: "{player} തുടങ്ങട്ടെ!",
  starterGoesFirst: "{player} ആദ്യം",
  starterHint: "പിന്നെ ക്രമത്തിൽ ഓരോരുത്തരായി.",

  // Discussion
  discussionTitle: "ഇനി ചർച്ച.",
  discussionBody: "സൂചനകൾ പറയൂ. ചോദ്യങ്ങൾ ചോദിക്കൂ. ഇമ്പോസ്റ്ററെ കണ്ടെത്തൂ.",
  discussionTip: "രഹസ്യ വാക്ക് ഒരിക്കലും ഉറക്കെ പറയരുത്.",
  startVoting: "വോട്ടിംഗ് തുടങ്ങാം",
  timerRunning: "ചർച്ചാ ടൈമർ",
  timerPaused: "നിർത്തിയിരിക്കുന്നു",
  timeUp: "സമയം കഴിഞ്ഞു!",
  pause: "ടൈമർ താൽക്കാലികമായി നിർത്തൂ",
  resume: "ടൈമർ തുടരൂ",
  restartTimer: "ടൈമർ വീണ്ടും തുടങ്ങൂ",
  skipTimer: "ടൈമർ ഒഴിവാക്കൂ",

  // Voting
  whoIsTheImposter: "ആരാണ് ഇമ്പോസ്റ്റർ?",
  votingHint: "സംശയമുള്ള ആളെ ടാപ്പ് ചെയ്ത് ഫലം കാണൂ.",
  revealResult: "ഫലം കാണിക്കൂ",
  selected: "തിരഞ്ഞെടുത്തു",
  votedFor: "നിങ്ങൾ {player}-ന് വോട്ട് ചെയ്തു.",

  // Result
  imposter: "ഇമ്പോസ്റ്റർ",
  theImposterWas: "ഇമ്പോസ്റ്റർ ആയിരുന്നത്…",
  theWordWas: "വാക്ക് ഇതായിരുന്നു…",
  secretWord: "രഹസ്യ വാക്ക്",
  imposterClueLabel: "ഇമ്പോസ്റ്ററുടെ സൂചന",
  groupWon: "ഗ്രൂപ്പ് ജയിച്ചു",
  imposterWon: "ഇമ്പോസ്റ്റർ ജയിച്ചു",
  groupWonBody: "{player}-നെ പിടികൂടി.",
  imposterWonBody: "{voted} നിരപരാധിയായിരുന്നു. {imposter} രക്ഷപ്പെട്ടു.",
  playAgain: "വീണ്ടും കളിക്കാം",
  changeSettings: "ക്രമീകരണങ്ങൾ",
  tapToContinue: "തുടരാൻ ടാപ്പ് ചെയ്യൂ",
  skipAhead: "ഒഴിവാക്കൂ",
  roundOver: "റൗണ്ട് കഴിഞ്ഞു",

  // How to play
  rulesTitle: "എങ്ങനെ കളിക്കാം",
  rulesIntro: "ഒരു ഫോണും സംശയാലുക്കളായ കൂട്ടുകാരും മതി — അതാണ് ഈ കളി.",
  rule1Title: "കളിക്കാരെ തിരഞ്ഞെടുക്കൂ",
  rule1Body: "എത്ര പേരുണ്ടെന്ന് തിരഞ്ഞെടുക്കൂ. എല്ലാവരും ഒരു ഫോൺ കൈമാറിയാണ് കളിക്കുന്നത്.",
  rule2Title: "വിഭാഗങ്ങൾ തിരഞ്ഞെടുക്കൂ",
  rule2Body: "ഭക്ഷണം, മൃഗങ്ങൾ, വീട്ടുസാധനങ്ങൾ — ഒന്നോ പലതോ തിരഞ്ഞെടുക്കാം.",
  rule3Title: "എല്ലാവരും റോൾ പരിശോധിക്കുന്നു",
  rule3Body: "ഓരോരുത്തരായി രഹസ്യമായി കാർഡ് കണ്ട് വീണ്ടും മറയ്ക്കുന്നു.",
  rule4Title: "എല്ലാവരും രഹസ്യ വാക്ക് കാണുന്നു",
  rule4Body: "ഇമ്പോസ്റ്റർ ഒഴികെ എല്ലാവരും.",
  rule5Title: "ഇമ്പോസ്റ്റർക്ക് ഒരു ചെറിയ സൂചന",
  rule5Body: "‘ഇമ്പോസ്റ്റർ സൂചന’ ഓണാണെങ്കിൽ മാത്രം. മനഃപൂർവ്വം അവ്യക്തമാണത്.",
  rule6Title: "ചർച്ച ചെയ്യൂ, സൂചനകൾ പറയൂ",
  rule6Body: "വാക്ക് പറയാതെ അതിനെക്കുറിച്ച് പറയൂ. ആര് പതറുന്നുവെന്ന് ശ്രദ്ധിക്കൂ.",
  rule7Title: "വോട്ട് ചെയ്യൂ",
  rule7Body: "കള്ളം പറയുന്നുവെന്ന് തോന്നുന്ന ആളെ ചൂണ്ടിക്കാണിക്കൂ.",
  rule8Title: "ഇമ്പോസ്റ്ററെ കണ്ടെത്തൂ",
  rule8Body: "വാക്ക് മനസ്സിലാക്കും മുമ്പ് പിടികൂടൂ — ഇല്ലെങ്കിൽ അവർ ജയിക്കും.",
  rulesTip: "ടിപ്പ്: സൂചനകൾ ബുദ്ധിപരമാകട്ടെ, വ്യക്തമാകരുത്. അമിത വ്യക്തത ഇമ്പോസ്റ്റർക്ക് വാക്ക് പറഞ്ഞുകൊടുക്കും.",

  // Leaving a round
  leaveRoundTitle: "ഈ റൗണ്ട് വിടണോ?",
  leaveRoundBody: "രഹസ്യ വാക്കും എല്ലാവരുടെയും റോളുകളും നഷ്ടപ്പെടും.",
  leave: "വിട്ടുപോകാം",
  stay: "കളി തുടരാം",
  exitToHome: "ഹോമിലേക്ക് പോകുക",

  // Errors / misc
  errorTitle: "എന്തോ തകരാറ് സംഭവിച്ചു",
  errorBody: "ഹോമിലേക്ക് പോയി പുതിയ റൗണ്ട് തുടങ്ങൂ.",
  roundLost: "ആ റൗണ്ട് കഴിഞ്ഞു. പുതിയത് തുടങ്ങൂ.",
  retry: "വീണ്ടും ശ്രമിക്കൂ",
  offlineReady: "ഓഫ്‌ലൈനായും കളിക്കാം",
  installApp: "ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യൂ",
  playerCount: "കളിക്കാരുടെ എണ്ണം",
  categoryPicker: "വിഭാഗം തിരഞ്ഞെടുക്കൽ",
  currentlySelected: "തിരഞ്ഞെടുത്തിരിക്കുന്നു",
  notSelected: "തിരഞ്ഞെടുത്തിട്ടില്ല",
};

export const translations: Record<Language, Translation> = { en, ml };

export const LANGUAGE_LABELS: Record<Language, string> = {
  ml: "മലയാളം",
  en: "English",
};

export type TranslationParams = Record<string, string | number>;

/**
 * Interpolates {placeholders}. Missing params are left as-is so problems are
 * visible during development rather than silently blank.
 */
export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * Resolves a translation with an explicit fallback chain. The Malayalam table
 * is type-complete, so the fallback only matters if data is edited at runtime
 * (or a new key is added without a translation). In development we warn loudly.
 */
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const table = translations[language];
  let value: string | undefined = table[key];
  if (value === undefined || value === "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Missing "${language}" translation for key "${key}"`);
    }
    value = en[key] ?? key;
  }
  return interpolate(value, params);
}
