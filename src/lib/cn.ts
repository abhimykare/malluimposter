/** Tiny className joiner — avoids pulling in clsx/tailwind-merge. */
export function cn(...values: Array<string | false | null | undefined>): string {
  let out = "";
  for (const value of values) {
    if (value) out += (out ? " " : "") + value;
  }
  return out;
}
