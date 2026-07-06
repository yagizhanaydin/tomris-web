/**
 * Şiddet, cinsiyetçi ve ırkçı içerik — küçük harfe çevrilmiş terimler.
 * Tam kelime ve birleşik yazım (kadınkiller) yakalanır.
 */
export const BANNED_TERMS: readonly string[] = [
  // Şiddet — EN
  "kill",
  "killer",
  "killing",
  "murder",
  "murderer",
  "rape",
  "rapist",
  "women killer",
  "woman killer",
  "femicide",
  "lynch",
  "genocide",
  "suicide bait",
  // Şiddet — TR
  "öldür",
  "oldur",
  "öldürme",
  "oldurme",
  "cinayet",
  "katil",
  "kadın katil",
  "kadin katil",
  "kadın öldür",
  "kadin oldur",
  "tecavüz",
  "tecavuz",
  "taciz",
  "linç",
  "linc",
  // Cinsiyetçi — EN
  "bitch",
  "whore",
  "slut",
  "cunt",
  "feminazi",
  "misogynist",
  "misogyny",
  // Cinsiyetçi — TR
  "orospu",
  "sürtük",
  "surtuk",
  "kahpe",
  "fahişe",
  "fahise",
  "kaltak",
  "amcık",
  "amcik",
  // Irkçılık — EN (yaygın slurler)
  "nigger",
  "nigga",
  "chink",
  "gook",
  "kike",
  "spic",
  // Irkçılık — TR
  "zenci",
  "arap köpeği",
  "arap kopegi",
  "çingene",
  "cingene",
  "gypsy",
];

export class ContentBlockedError extends Error {
  constructor() {
    super("CONTENT_BLOCKED");
    this.name = "ContentBlockedError";
  }
}

function normalizeForFilter(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ğüşıöç\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Yasaklı kelime / ifade var mı? */
export function findBannedTerm(text: string): string | null {
  if (!text.trim()) return null;

  const normalized = normalizeForFilter(text);
  const compact = normalized.replace(/\s/g, "");

  for (const term of BANNED_TERMS) {
    const t = normalizeForFilter(term);
    const tCompact = t.replace(/\s/g, "");
    if (normalized.includes(t) || compact.includes(tCompact)) {
      return term;
    }
  }
  return null;
}

export function assertSafeContent(text: string): void {
  if (findBannedTerm(text)) {
    throw new ContentBlockedError();
  }
}

export function isSafeContent(text: string): boolean {
  return findBannedTerm(text) === null;
}
