/**
 * Renders one word as an early modern printer might have set it: "&" for "and",
 * I for initial J, V for initial U, "-ick" for "-ic", and long-s (ſ) for a
 * lowercase s followed by a letter other than f. Punctuation is kept.
 */
export function periodize(word: string): string {
  if (word.toLowerCase() === 'and') return '&';
  const w = word
    .replace(/^J/, 'I')
    .replace(/^U/, 'V')
    .replace(/ic(\W*)$/, 'ick$1');
  const chars = [...w];
  return chars
    .map((ch, i) => {
      const next = chars[i + 1] ?? '';
      return ch === 's' && /\p{L}/u.test(next) && next !== 'f' ? 'ſ' : ch;
    })
    .join('');
}
