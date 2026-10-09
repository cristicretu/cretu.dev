/* Links that have gone dark, pointed at the Wayback Machine instead. The data keeps the original
   addresses (they still match GitHub repos for dating); every link shown on the site goes
   through `live`, which swaps a dead one for its archived copy closest to when it was alive. */

const DEAD: Record<string, string | null> = {
  'https://deta.space/': '20231015171402',
  'https://deta.space/discovery/@cristicretu/stacks': '20231126220348',
  'https://meshgrad.cretu.dev/': '20221128022716',
  'https://light.cretu.dev/': '20220711063424',
  'https://template.cretu.dev/': '20211005142656',
  'https://wordle.cretu.dev/': '20220130004442',
  'https://writer.cretu.dev/': '20230325085413',
  'https://knob.cretu.dev/': '20230512173916',
  // Gone, and never archived: shown without a link.
  'https://covid.cretu.dev/': null,
  'https://roogle.cretu.dev/': null,
};

const norm = (u: string) => (/^https?:\/\/[^/]+$/.test(u) ? `${u}/` : u);

/** The address to link to: the original, the Wayback Machine's copy if it's gone, or nothing. */
export function live(url: string): string;
export function live(url: string | undefined): string | undefined;
export function live(url: string | undefined) {
  if (!url) return url;
  const when = DEAD[norm(url)];
  if (when === null) return undefined;
  return when ? `https://web.archive.org/web/${when}/${norm(url)}` : url;
}
