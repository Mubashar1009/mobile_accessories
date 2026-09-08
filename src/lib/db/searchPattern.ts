import "server-only";

/**
 * Escaping helpers for turning raw user input into a case-insensitive
 * "contains" search, for each adapter's native operator.
 *
 * A search term typed by a user is DATA, not pattern syntax. Unescaped,
 * someone searching for `50%` would get the pattern `%50%%` — matching every
 * row containing "50" — and `_` would silently match any single character.
 * Neither is what the user asked for, and an all-wildcard pattern is also a
 * cheap way to force a full table scan.
 *
 * The two adapters deliberately use DIFFERENT operators. See
 * `containsRegexTerm` for why the Supabase path cannot use ILIKE; both
 * produce the same observable behaviour (case-insensitive literal substring
 * match), which the `search` integration cases assert against a live
 * database for both adapters.
 */

// ── SQL path: ILIKE ──────────────────────────────────────────────────────

/**
 * Escapes the three `LIKE`/`ILIKE` metacharacters. Postgres uses `\` as the
 * default escape character, so this makes the term a literal.
 */
export function escapeLikeTerm(term: string): string {
  // Backslash first — otherwise it would double-escape the backslashes this
  // function itself introduces for % and _.
  return term
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/** Wraps an escaped term as an ILIKE "contains" pattern. */
export function containsPattern(term: string): string {
  return `%${escapeLikeTerm(term)}%`;
}

// ── Supabase path: POSIX regex (`imatch` / `~*`) ─────────────────────────

/**
 * Escapes every POSIX ERE metacharacter, making the term a literal string.
 *
 * Because every metacharacter is escaped, the resulting regex contains no
 * alternation or quantifiers — so there is no backtracking blowup to worry
 * about from hostile input.
 */
export function escapeRegexTerm(term: string): string {
  return term.replace(/[.^$*+?()[\]{}|\\]/g, (match) => `\\${match}`);
}

/**
 * Builds the value for PostgREST's `imatch` operator (Postgres `~*`).
 *
 * This exists instead of reusing `containsPattern` because PostgREST
 * rewrites `*` to `%` inside `like`/`ilike` values — an alias for callers who
 * want a wildcard, but corruption for a literal term. Verified against a live
 * PostgREST: searching `r*I` with `ilike` matched `StarXItem` and
 * `StarYItem`, and pre-escaping it as `\*` only moved the problem (PostgREST
 * rewrote it to `\%`, so it then matched `Star%Item`). There is no encoding
 * of `*` that survives an `ilike` value intact.
 *
 * `~*` has no such rewriting, is already case-insensitive, and is unanchored
 * — which is exactly "contains" — so a fully escaped regex gives the literal
 * match ILIKE gives on the raw-SQL side.
 */
export function containsRegexTerm(term: string): string {
  return escapeRegexTerm(term);
}

/**
 * Quotes a value for a PostgREST filter string (the `or=(...)` syntax that
 * supabase-js's `.or()` builds).
 *
 * PostgREST splits those filters on commas and parentheses, so an unquoted
 * term containing either would be parsed as filter *structure* rather than
 * as a value — a search for `a,b` would become two bogus conditions.
 * Wrapping the value in double quotes makes PostgREST treat the whole thing
 * as one literal; inside those quotes `\` and `"` must themselves be
 * escaped, which is also what preserves the escapes added above.
 */
export function quotePostgrestValue(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}
