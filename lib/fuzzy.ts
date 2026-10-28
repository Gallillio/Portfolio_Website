/**
 * Forgiving matching for the site's typed filters: the command sheet's filter
 * and the projects page's technology search. A filter only narrows a short
 * list, so it can afford to guess; the terminal prompt runs what it is given
 * and only borrows editDistance for its "Did you mean".
 */

/**
 * Edits between two words, counting a swap of neighbouring letters as one
 * ("porjects"): the optimal string alignment form of Damerau-Levenshtein.
 */
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

// "Node.js", "node js" and "nodejs" are the same search.
const compact = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "")
// Words split at spaces and punctuation, and where a lower-case letter meets a
// capital, so "NextJS" also starts a word at "JS".
const words = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/** One edit for four letters or fewer, two above, so short input doesn't match everything. */
const typoLimit = (length: number) => (length < 3 ? 0 : length <= 4 ? 1 : 2)

/**
 * Edits from the query to the word, or one edit from the word's start while it
 * is still being typed. A start can be cut anywhere, so it gets less leeway:
 * two edits let "react" reach "vect".
 */
function typoDistance(query: string, word: string, limit: number): number {
  const whole = editDistance(query, word)
  if (whole <= limit) return whole
  // A prefix one letter either side of the query's length, so a dropped or
  // doubled letter still lines up ("postgress" against "postgresq").
  if (query.length >= 4 && word.length > query.length) {
    for (let length = query.length - 1; length <= query.length + 1; length++) {
      if (editDistance(query, word.slice(0, length)) <= 1) return 1
    }
  }
  return whole
}

/** The shortest stretch of text holding the query's letters in order, or -1. */
function subsequenceSpan(query: string, text: string): number {
  let best = -1
  for (let start = text.indexOf(query[0]); start !== -1; start = text.indexOf(query[0], start + 1)) {
    let at = start
    for (let i = 1; i < query.length && at !== -1; i++) at = text.indexOf(query[i], at + 1)
    if (at === -1) break
    const span = at - start + 1
    if (best === -1 || span < best) best = span
  }
  return best
}

/**
 * How well the query matches the text: 0 for no match, higher for better.
 * Best first: the whole text, its start, a word's start, anywhere inside it,
 * the words' initials ("rn" for React Native), its letters in order ("nxt" for
 * NextJS), then a typo in a word ("tailwnd", "corses").
 *
 * The initials and in-order letters suit a short name or label. A sentence
 * holds almost any letters in order, so `loose: false` leaves those two out.
 */
export function fuzzyScore(query: string, text: string, { loose = true } = {}): number {
  const q = compact(query)
  if (!q) return 0
  const t = compact(text)
  if (!t) return 0
  const tokens = words(text)

  if (t === q) return 1000
  if (t.startsWith(q)) return 900 - (t.length - q.length)
  if (tokens.some((word) => word.startsWith(q))) return 800
  // Initials before the middle of a word: "rn" means React Native, not Seaborn.
  if (loose && q.length >= 2 && tokens.length > 1 && tokens.map((word) => word[0]).join("").startsWith(q)) return 750
  if (t.includes(q)) return 700 - t.indexOf(q)

  // Two letters turn up in order in most names ("py" in Shopify), so three.
  if (loose && q.length >= 3) {
    const span = subsequenceSpan(q, t)
    // Letters spread over more than twice the query's length are a coincidence.
    if (span !== -1 && span <= q.length * 2) return 500 - (span - q.length) * 10
  }

  const limit = typoLimit(q.length)
  if (limit === 0) return 0
  const distance = Math.min(...[t, ...tokens].map((word) => typoDistance(q, word, limit)))
  return distance <= limit ? 400 - distance * 100 : 0
}

/**
 * The items that match the query, best first; ties keep the list's order. An
 * empty query keeps every item in its order.
 *
 * `name` is matched loosely. `detail`, a longer description, is matched
 * strictly and counts for less, so an item named like the query stays above
 * one that only mentions it.
 */
export function fuzzyFilter<T>(
  items: readonly T[],
  query: string,
  name: (item: T) => string,
  detail?: (item: T) => string,
): T[] {
  if (!compact(query)) return [...items]
  const score = (item: T) =>
    Math.max(fuzzyScore(query, name(item)), detail ? fuzzyScore(query, detail(item), { loose: false }) / 2 : 0)
  return items
    .map((item, index) => ({ item, index, score: score(item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item)
}
