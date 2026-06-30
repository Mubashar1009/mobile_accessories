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

// ── CartItem type ──────────────────────────────────────────────────────
export interface CartItem {
  id: string; // matches product.id
  product: Product;
  quantity: number;
}

// ── Category constants ────────────────────────────────────────────────
export const CATEGORIES = [
  { slug: "earbuds", label: "Earbuds" },
  { slug: "headphones", label: "Headphones" },
  { slug: "speakers", label: "Speakers" },
  { slug: "power-banks", label: "Power Banks" },
  { slug: "smart-trackers", label: "Smart Trackers" },
  { slug: "lcd-panels", label: "LCD Panels" },
  { slug: "parts", label: "Parts" },
  { slug: "cables", label: "Cables" },
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
    case "lcd-panels":
      return text.includes("lcd") || text.includes("panel") || text.includes("display") || text.includes("screen");
    case "parts":
      return text.includes("part") || text.includes("battery replacement") || text.includes("back glass") || text.includes("camera") || text.includes("flex");
    case "cables":
      return text.includes("cable") || text.includes("wire") || text.includes("usb");
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
  cart: {
    key: string;
    value: CartItem;
  };
}

const DB_NAME = "product-catalog";
const DB_VERSION = 3;

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
        if (!db.objectStoreNames.contains("cart")) {
          db.createObjectStore("cart", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// ── Cart IndexedDB operations ──────────────────────────────────────────
export async function getCartItems(): Promise<CartItem[]> {
  const db = await getDB();
  return db.getAll("cart");
}

export async function saveCartItem(item: CartItem): Promise<void> {
  const db = await getDB();
  await db.put("cart", item);
}

export async function deleteCartItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("cart", id);
}

export async function clearCart(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("cart", "readwrite");
  await tx.objectStore("cart").clear();
  await tx.done;
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
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&q=80",
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
    image_url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80",
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
    image_url: "https://images.unsplash.com/photo-1608754236920-3a27e7e758b2?w=500&q=80",
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
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
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
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
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
  {
    id: "demo-9",
    title: "iPhone 13 Pro Max LCD Panel",
    description: "Original OLED Display Panel | Super Retina XDR",
    price: 34999,
    original_price: 39999,
    tag: "Original Quality",
    category: "lcd-panels",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-10",
    title: "Premium Battery for iPhone 12",
    description: "Zero-cycle replacement battery | 2815mAh with adhesive",
    price: 3850,
    original_price: 4500,
    tag: "High Capacity",
    category: "parts",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-11",
    title: "Braided 100W USB-C to USB-C Cable",
    description: "2-meter rugged nylon braided cable | PD 3.0 Fast Charging",
    price: 1450,
    original_price: 1999,
    tag: "Best Seller",
    category: "cables",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
    is_out_of_stock: false,
    created_at: new Date().toISOString(),
  },
];
