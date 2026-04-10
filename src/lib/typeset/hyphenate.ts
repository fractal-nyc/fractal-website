// Adapted from somnai-dreams/pretext-demos (justification-comparison.js) by Maxwell Ingham.
// Source: https://github.com/somnai-dreams/pretext-demos
// MIT License. Extended with HYPHEN_EXCEPTIONS for Fractal NYC hero copy.

export const HYPHEN_EXCEPTIONS: Record<string, string[]> = {
  // From the demo
  extensively: ["ex", "ten", "sive", "ly"],
  relationship: ["re", "la", "tion", "ship"],
  typographic: ["ty", "po", "graph", "ic"],
  comfortable: ["com", "fort", "a", "ble"],
  horizontal: ["hor", "i", "zon", "tal"],
  vertically: ["ver", "ti", "cal", "ly"],
  disrupting: ["dis", "rupt", "ing"],
  comprehension: ["com", "pre", "hen", "sion"],
  traditional: ["tra", "di", "tion", "al"],
  combination: ["com", "bi", "na", "tion"],
  techniques: ["tech", "niques"],
  hyphenation: ["hy", "phen", "a", "tion"],
  dictionaries: ["dic", "tion", "ar", "ies"],
  permitted: ["per", "mit", "ted"],
  syllable: ["syl", "la", "ble"],
  boundaries: ["bound", "a", "ries"],
  letterspacing: ["let", "ter", "spac", "ing"],
  adjustments: ["ad", "just", "ments"],
  distributed: ["dis", "trib", "u", "ted"],
  additional: ["ad", "di", "tion", "al"],
  individual: ["in", "di", "vid", "u", "al"],
  characters: ["char", "ac", "ters"],
  significantly: ["sig", "nif", "i", "cant", "ly"],
  optimization: ["op", "ti", "mi", "za", "tion"],
  evaluated: ["e", "val", "u", "at", "ed"],
  thousands: ["thou", "sands"],
  possible: ["pos", "si", "ble"],
  arrangement: ["ar", "range", "ment"],
  minimizing: ["min", "i", "miz", "ing"],
  deviation: ["de", "vi", "a", "tion"],
  paragraph: ["par", "a", "graph"],
  algorithm: ["al", "go", "rithm"],
  developed: ["de", "vel", "oped"],
  typesetting: ["type", "set", "ting"],
  constructs: ["con", "structs"],
  feasible: ["fea", "si", "ble"],
  breakpoints: ["break", "points"],
  produces: ["pro", "du", "ces"],
  uniform: ["u", "ni", "form"],
  throughout: ["through", "out"],
  simplified: ["sim", "pli", "fied"],
  implementation: ["im", "ple", "men", "ta", "tion"],
  dramatically: ["dra", "mat", "i", "cal", "ly"],
  processors: ["proc", "es", "sors"],
  justification: ["jus", "ti", "fi", "ca", "tion"],
  operates: ["op", "er", "ates"],
  strictly: ["strict", "ly"],
  distributes: ["dis", "trib", "utes"],
  remaining: ["re", "main", "ing"],
  uniformly: ["u", "ni", "form", "ly"],
  requires: ["re", "quires"],
  lookahead: ["look", "a", "head"],
  executes: ["ex", "e", "cutes"],
  quickly: ["quick", "ly"],
  inconsistent: ["in", "con", "sis", "tent"],
  particularly: ["par", "tic", "u", "lar", "ly"],
  enormous: ["e", "nor", "mous"],
  preceding: ["pre", "ced", "ing"],
  compositor: ["com", "pos", "i", "tor"],
  twentieth: ["twen", "ti", "eth"],
  century: ["cen", "tu", "ry"],
  perceived: ["per", "ceived"],
  streaks: ["streaks"],
  scanning: ["scan", "ning"],
  impediment: ["im", "ped", "i", "ment"],
  addressed: ["ad", "dressed"],
  combinations: ["com", "bi", "na", "tions"],
  measuring: ["meas", "ur", "ing"],
  measurable: ["meas", "ur", "a", "ble"],
  reading: ["read", "ing"],
  spacing: ["spac", "ing"],
  between: ["be", "tween"],
  excessive: ["ex", "ces", "sive"],
  aesthetic: ["aes", "thet", "ic"],
  merely: ["mere", "ly"],
  constitute: ["con", "sti", "tute"],
  lateral: ["lat", "er", "al"],
  skilled: ["skilled"],
  readers: ["read", "ers"],
  depend: ["de", "pend"],
  studying: ["stud", "y", "ing"],
  studied: ["stud", "ied"],
  comfort: ["com", "fort"],
  colour: ["col", "our"],
  working: ["work", "ing"],
  horrified: ["hor", "ri", "fied"],
  especially: ["es", "pe", "cial", "ly"],
  precisely: ["pre", "cise", "ly"],
  browsers: ["brows", "ers"],
  modern: ["mod", "ern"],
  approach: ["ap", "proach"],
  wildly: ["wild", "ly"],
  columns: ["col", "umns"],
  single: ["sin", "gle"],
  standard: ["stan", "dard"],
  Michael: ["Mi", "cha", "el"],
  Donald: ["Don", "ald"],
  remains: ["re", "mains"],
  system: ["sys", "tem"],
  rather: ["rath", "er"],
  greedily: ["greed", "i", "ly"],
  filling: ["fill", "ing"],
  shortest: ["short", "est"],
  results: ["re", "sults"],
  greedy: ["greed", "y"],
  number: ["num", "ber"],
  completely: ["com", "plete", "ly"],
  different: ["dif", "fer", "ent"],
  problem: ["prob", "lem"],
  amounts: ["a", "mounts"],
  entire: ["en", "tire"],
  global: ["glob", "al"],
  metal: ["met", "al"],
  every: ["ev", "ery"],
  inter: ["in", "ter"],

  // Fractal NYC hero-copy additions (FRAC-158)
  apartment: ["a", "part", "ment"],
  agentic: ["a", "gen", "tic"],
  alone: ["a", "lone"],
  believe: ["be", "lieve"],
  building: ["build", "ing"],
  campus: ["cam", "pus"],
  collaboration: ["col", "lab", "o", "ra", "tion"],
  context: ["con", "text"],
  cyborgism: ["cy", "borg", "ism"],
  decided: ["de", "cid", "ed"],
  deeply: ["deep", "ly"],
  dinners: ["din", "ners"],
  embrace: ["em", "brace"],
  experimentation: ["ex", "per", "i", "men", "ta", "tion"],
  faster: ["fast", "er"],
  golden: ["gold", "en"],
  joyful: ["joy", "ful"],
  minute: ["min", "ute"],
  neighborhood: ["neigh", "bor", "hood"],
  other: ["oth", "er"],
  people: ["peo", "ple"],
  problems: ["prob", "lems"],
  protocol: ["pro", "to", "col"],
  started: ["start", "ed"],
  together: ["to", "geth", "er"],
  tools: ["tools"],
  weekly: ["week", "ly"],
};

export const PREFIXES: readonly string[] = [
  "anti", "auto", "be", "bi", "co", "com", "con", "contra", "counter", "de",
  "dis", "en", "em", "ex", "extra", "fore", "hyper", "il", "im", "in",
  "inter", "intra", "ir", "macro", "mal", "micro", "mid", "mis", "mono",
  "multi", "non", "omni", "out", "over", "para", "poly", "post", "pre",
  "pro", "pseudo", "quasi", "re", "retro", "semi", "sub", "super", "sur",
  "syn", "tele", "trans", "tri", "ultra", "un", "under",
];

export const SUFFIXES: readonly string[] = [
  "able", "ible", "tion", "sion", "ment", "ness", "ous", "ious", "eous",
  "ful", "less", "ive", "ative", "itive", "al", "ial", "ical", "ing",
  "ling", "ed", "er", "est", "ism", "ist", "ity", "ety", "ty", "ence",
  "ance", "ly", "fy", "ify", "ize", "ise", "ure", "ture",
];

export function hyphenateWord(word: string): string[] {
  const lower = word.toLowerCase().replace(/[.,;:!?"'""''—–\-]/g, "");
  if (lower.length < 5) return [word];
  const exc = HYPHEN_EXCEPTIONS[lower];
  if (exc) {
    const parts: string[] = [];
    let pos = 0;
    for (const part of exc) {
      parts.push(word.slice(pos, pos + part.length));
      pos += part.length;
    }
    if (pos < word.length) {
      parts[parts.length - 1] += word.slice(pos);
    }
    return parts.filter((p) => p.length > 0);
  }
  for (const prefix of PREFIXES) {
    if (lower.startsWith(prefix) && lower.length - prefix.length >= 3) {
      return [word.slice(0, prefix.length), word.slice(prefix.length)];
    }
  }
  for (const suffix of SUFFIXES) {
    if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
      const cut = word.length - suffix.length;
      return [word.slice(0, cut), word.slice(cut)];
    }
  }
  return [word];
}

/**
 * Splits text on whitespace and joins hyphenated word parts with the
 * U+00AD soft hyphen character. The result is a single string suitable
 * for passing to `prepareWithSegments` — the soft hyphens become break
 * candidates that the Knuth-Plass layout can use without affecting the
 * visible text when rendered without a break.
 */
export function softHyphenate(text: string): string {
  const tokens = text.split(/(\s+)/);
  return tokens
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const parts = hyphenateWord(token);
      if (parts.length <= 1) return token;
      return parts.join("\u00AD");
    })
    .join("");
}
