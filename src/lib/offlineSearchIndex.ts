/**
 * A hand-rolled, tokenized full-text search index backed by the raw
 * IndexedDB API — no wrapper library. This mirrors whatever list-shaped
 * entity the app fetches from its API (products today) into two stores:
 *
 * - "items": one record per entity, keyed by "id", plus a "tokens" array
 *   (every searchable field lowercased and split into words) indexed with
 *   `multiEntry: true` so the index has one entry per word, not per record.
 * - "meta": small key/value store, currently just "lastSyncedAt".
 *
 * This index is independent from any other IndexedDB the app uses (e.g.
 * the full-record product cache in `offlineCache.ts`) — it exists purely
 * to answer `searchOffline()` without ever touching the network.
 */

const DB_NAME = "offline-search-index";
const DB_VERSION = 1;
const ITEMS_STORE = "items";
const META_STORE = "meta";
const TOKENS_INDEX = "tokens";
const LAST_SYNCED_KEY = "lastSyncedAt";

interface MetaRecord {
  key: string;
  value: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const items = db.createObjectStore(ITEMS_STORE, { keyPath: "id" });
        items.createIndex(TOKENS_INDEX, TOKENS_INDEX, { multiEntry: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function promisifyTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Lowercases and splits text into individual words, dropping punctuation. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

function tokenizeRecord<T>(record: T, searchFields: (keyof T)[]): string[] {
  const values: unknown[] = searchFields.map((field) => record[field]);
  const text = values.filter((value): value is string => typeof value === "string").join(" ");
  return Array.from(new Set(tokenize(text)));
}

/**
 * Called every time a fresh online fetch succeeds. Tokenizes `searchFields`
 * on each record and `put()`s it into "items", overwriting any existing
 * record with the same id — never clear-then-repopulate, so a slow sync
 * can't blank out search results mid-query. Updates "lastSyncedAt" in the
 * same transaction so a sync either fully lands or has no effect at all.
 */
export async function syncItems<T extends { id: IDBValidKey }>(
  items: T[],
  searchFields: (keyof T)[]
): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const db = await getDB();
  const tx = db.transaction([ITEMS_STORE, META_STORE], "readwrite");
  const itemsStore = tx.objectStore(ITEMS_STORE);
  const metaStore = tx.objectStore(META_STORE);

  for (const item of items) {
    itemsStore.put({ ...item, tokens: tokenizeRecord(item, searchFields) });
  }
  metaStore.put({ key: LAST_SYNCED_KEY, value: Date.now() } satisfies MetaRecord);

  await promisifyTransaction(tx);
}

/**
 * Tokenizes `query` the same way as `syncItems`, then matches purely
 * against the local IndexedDB mirror — it never touches the network, so it
 * behaves identically online or offline.
 *
 * The first word is matched via the multiEntry "tokens" index using a
 * prefix range (`[word, word + '\uffff']`), which IndexedDB can answer
 * without scanning every record. Any further words are required to
 * prefix-match at least one token on each candidate (AND semantics across
 * words), checked in memory since a compound index can't express that.
 */
export async function searchOffline<T = unknown>(query: string): Promise<T[]> {
  if (typeof indexedDB === "undefined") return [];

  const [firstWord, ...restWords] = tokenize(query);
  if (!firstWord) return [];

  const db = await getDB();
  const tx = db.transaction(ITEMS_STORE, "readonly");
  const index = tx.objectStore(ITEMS_STORE).index(TOKENS_INDEX);
  const range = IDBKeyRange.bound(firstWord, firstWord + "\uffff");

  const candidates = await promisifyRequest<
    (T & { id: IDBValidKey; tokens: string[] })[]
  >(index.getAll(range));

  const matches = restWords.length
    ? candidates.filter((candidate) =>
        restWords.every((word) => candidate.tokens.some((token) => token.startsWith(word)))
      )
    : candidates;

  // A record can appear once per matching token on a multiEntry index (e.g.
  // two tokens both starting with "ear"), so dedupe by id.
  const seen = new Set<IDBValidKey>();
  const results: T[] = [];
  for (const match of matches) {
    if (seen.has(match.id)) continue;
    seen.add(match.id);
    const record: Record<string, unknown> = { ...match };
    delete record.tokens;
    results.push(record as T);
  }
  return results;
}

/** Reads the last successful `syncItems()` timestamp, or null if never synced. */
export async function getLastSyncedAt(): Promise<number | null> {
  if (typeof indexedDB === "undefined") return null;

  const db = await getDB();
  const tx = db.transaction(META_STORE, "readonly");
  const record = await promisifyRequest<MetaRecord | undefined>(
    tx.objectStore(META_STORE).get(LAST_SYNCED_KEY)
  );
  return record?.value ?? null;
}
