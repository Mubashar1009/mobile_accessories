import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Product type matching the Supabase schema ──────────────────────────
export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  tag: string | null;
  category: string | null;
  colors?: string | null;
  image_url: string | null;
  is_out_of_stock: boolean;
  created_at: string;
}

// ── Category constants ────────────────────────────────────────────────
export const CATEGORIES = [
  { slug: "earbuds", label: "Earbuds" },
  { slug: "headphones", label: "Headphones" },
  { slug: "speakers", label: "Speakers" },
  { slug: "power-banks", label: "Power Banks" },
  { slug: "smart-trackers", label: "Smart Trackers" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// ── Helper: match a product to a category slug ─────────────────────────
export function matchesCategory(product: Product, slug: string): boolean {
  if (product.category) {
    return product.category === slug;
  }
  // Fallback: infer from title/description for demo products without a category field
  const text = `${product.title} ${product.description ?? ""}`.toLowerCase();
  switch (slug) {
    case "earbuds":
      return text.includes("earbud");
    case "headphones":
      return text.includes("headphone");
    case "speakers":
      return text.includes("speaker");
    case "power-banks":
      return text.includes("power bank");
    case "smart-trackers":
      return text.includes("tracker") || text.includes("tag");
    default:
      return false;
  }
}


// ── Helper: calculate discount percentage ─────────────────────────────
export function getDiscount(product: Product): number | null {
  if (product.original_price && product.original_price > product.price) {
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }
  return null;
}

// ── Helper: check if product is new (created within 7 days) ───────────
export function isNew(product: Product): boolean {
  const weekAgo = Date.now() - 7 * 86400000;
  return new Date(product.created_at).getTime() > weekAgo;
}

// ── IDB schema definition ──────────────────────────────────────────────
interface ProductCatalogDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: {
      "by-created_at": string;
    };
  };
}

const DB_NAME = "product-catalog";
const DB_VERSION = 2;

// ── Singleton database connection ──────────────────────────────────────
let dbPromise: Promise<IDBPDatabase<ProductCatalogDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ProductCatalogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("by-created_at", "created_at");
        }
      },
    });
  }
  return dbPromise;
}

// ── Save all products (full replace from Supabase sync) ────────────────
export async function saveProducts(products: Product[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("products", "readwrite");
  const store = tx.objectStore("products");

  store.clear();
  for (const product of products) {
    store.put(product); // fire-and-forget inside transaction — batched
  }

  await tx.done; // single await for the entire batch
}

// ── Get all products from IndexedDB (offline fallback) ─────────────────
export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAllFromIndex("products", "by-created_at");
  return products.reverse();
}

// ── Get a single product by ID ─────────────────────────────────────────
export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDB();
  return db.get("products", id);
}

// ── Save or update a single product ────────────────────────────────────
export async function upsertProduct(product: Product): Promise<void> {
  const db = await getDB();
  await db.put("products", product);
}

// ── Delete a single product from IndexedDB ─────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("products", id);
}

// ── Demo products ──────────────────────────────────────────────────────
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-1",
    title: "Evolve Earbuds",
    description: "Dual ear fit | Customize half & full in-ear",
    price: 4995,
    original_price: 6495,
    tag: "Newly Launched",
    category: "earbuds",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "demo-2",
    title: "Vesper AI Earbuds",
    description: "164+ Language Translator | ANC & ENC",
    price: 7595,
    original_price: 9095,
    tag: "AI Voice Translator",
    category: "earbuds",
    image_url: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "demo-3",
    title: "Warrior Earbuds",
    description: "Environmental Noise Cancellation | Gaming Buds",
    price: 5895,
    original_price: 7395,
    tag: "Newly Launched",
    category: "earbuds",
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    is_out_of_stock: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "demo-4",
    title: "Megawatt Power Bank",
    description: "30000 mAh | 65 Watt Max | Built-in Type-C Cable",
    price: 10995,
    original_price: 12995,
    tag: "Newly Launched",
    category: "power-banks",
    image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-5",
    title: "Magnus Headphones",
    description: "Dedicated Active Noise Cancellation | Mood Tuned Sound",
    price: 6995,
    original_price: 9995,
    tag: "Software Based",
    category: "headphones",
    image_url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "demo-6",
    title: "Hurricane Headphones",
    description: "25ms Ultra-Low Latency | Play Station | Laptop | Mobile",
    price: 8995,
    original_price: 11995,
    tag: "Gaming Headphone",
    category: "headphones",
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-7",
    title: "Reverb Speaker",
    description: "Portable Speaker | Dynamic LED",
    price: 4995,
    original_price: 5995,
    tag: "Newly Launched",
    category: "speakers",
    image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80",
    is_out_of_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-8",
    title: "Pulse Power Bank",
    description: "10000 mAh | 22.5 Watt Max | Digital Display",
    price: 5640,
    original_price: 7995,
    tag: "Newly Launched",
    category: "power-banks",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date().toISOString(),
  },
];
