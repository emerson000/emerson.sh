// Cryptonym generation, ported from the old React CryptonymGenerator.
// The proper-noun filter (compromise.js at runtime) is gone: nouns.json was
// cleaned once at migration, so it holds lowercase common nouns only.

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Uniform random integer in [0, n) from the browser's CSPRNG, without modulo bias. */
export function randInt(n: number): number {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % n;
}

export interface Options {
  /** "" for none, "rand" for two random letters, or two letters. */
  digraph: string;
  maxLength: number;
  count: number;
}

export function cryptonyms(nouns: string[], { digraph, maxLength, count }: Options): string[] {
  const pool = nouns.filter((w) => w.length <= maxLength).map((w) => w.toUpperCase());
  if (!pool.length) return [];
  // One digraph per batch: the digraph is what groups the names.
  const pre =
    digraph === "rand" ? LETTERS[randInt(26)] + LETTERS[randInt(26)] : /^[A-Za-z]{2}$/.test(digraph) ? digraph.toUpperCase() : "";

  if (count <= 1) return [pre + pool[randInt(pool.length)]];

  // One word per starting letter in turn, A to Z and round again, never repeating
  // a word; then sorted, as the original tool did.
  const byLetter = new Map<string, string[]>();
  for (const w of pool) byLetter.set(w[0], [...(byLetter.get(w[0]) ?? []), w]);
  const picked: string[] = [];
  const total = Math.min(count, pool.length);
  for (let i = 0; picked.length < total; i = (i + 1) % 26) {
    const bucket = byLetter.get(LETTERS[i]);
    if (!bucket?.length) continue;
    picked.push(bucket.splice(randInt(bucket.length), 1)[0]);
  }
  return picked.sort().map((w) => pre + w);
}
