import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// ─────────────────────────────────────────────
// Adapter Interface — pg ya koi bhi db use karo
// ─────────────────────────────────────────────

export interface DatabaseAdapter {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: T[] }>;

  transaction<T>(fn: () => Promise<T>): Promise<T>;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

// ─────────────────────────────────────────────
// Built-in PostgreSQL Adapter (pg library)
// ─────────────────────────────────────────────

export class PostgresAdapter implements DatabaseAdapter {
  private client: import("pg").Client;

  constructor(connectionString: string) {
    // Dynamic import to avoid hard dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require("pg");
    this.client = new Client({ connectionString });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: T[] }> {
    const result = await this.client.query(sql, params);
    return { rows: result.rows as T[] };
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.client.query("BEGIN");
    try {
      const result = await fn();
      await this.client.query("COMMIT");
      return result;
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw error;
    }
  }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MigrationRecord {
  version: string;
  name: string;
  file_path: string | null;
  applied_at: Date;
  execution_time: number;
}

export interface MigrationFile {
  filePath: string;
  version: string;
  name: string;
}

export interface MigrationStatus {
  applied: MigrationRecord[];
  pending: string[];
}

export interface MigrationManagerConfig {
  /** Custom adapter — default: PostgresAdapter using DATABASE_URL */
  adapter?: DatabaseAdapter;
  /** Path to migrations folder — default: ./migrations */
  migrationsPath?: string;
  /** Tracking table name — default: schema_migrations */
  tableName?: string;
  /** Schema name — default: public */
  schema?: string;
}

// ─────────────────────────────────────────────
// MigrationManager
// ─────────────────────────────────────────────

export class MigrationManager {
  private adapter: DatabaseAdapter;
  private migrationsPath: string;
  private tableName: string;
  private schema: string;

  constructor(config: MigrationManagerConfig = {}) {
    // Use provided adapter OR create default PostgresAdapter from DATABASE_URL
    if (config.adapter) {
      this.adapter = config.adapter;
    } else {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "❌ DATABASE_URL is not set in .env — ya phir apna custom adapter pass karo"
        );
      }
      this.adapter = new PostgresAdapter(process.env.DATABASE_URL);
    }

    this.migrationsPath = path.resolve(config.migrationsPath ?? "./migrations");
    this.schema = config.schema ?? "public";
    this.tableName =
      this.schema !== "public"
        ? `${this.schema}.${config.tableName ?? "schema_migrations"}`
        : (config.tableName ?? "schema_migrations");
  }

  // ─── Connect / Disconnect ───────────────────

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  // ─── Initialize Tracking Table ──────────────

  async initialize(): Promise<void> {
    await this.adapter.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        version        VARCHAR(255) PRIMARY KEY,
        name           VARCHAR(255) NOT NULL,
        file_path      VARCHAR(500),
        applied_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER NOT NULL
      )
    `);

    // file_path column add karo agar existing table mein nahi hai
    await this.adapter
      .query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = '${this.tableName.split(".").pop()}'
            AND column_name = 'file_path'
          ) THEN
            ALTER TABLE ${this.tableName} ADD COLUMN file_path VARCHAR(500);
          END IF;
        END $$;
      `)
      .catch(() => {
        // Ignore — column already exists
      });
  }

  // ─── Discover Migration Files ────────────────

  private discoverMigrations(): MigrationFile[] {
    if (!fs.existsSync(this.migrationsPath)) {
      console.warn(`⚠️  migrations/ folder nahi mila: ${this.migrationsPath}`);
      return [];
    }

    const migrations: MigrationFile[] = [];

    const scan = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else {
          // Pattern: 001_create_users.sql | 001_create_users.ts | 001_create_users.js
          const match = entry.name.match(/^(\d+)_(.+)\.(sql|ts|js)$/);
          if (match) {
            migrations.push({
              filePath: fullPath,
              version: match[1],
              name: match[2].replace(/_/g, " "),
            });
          }
        }
      }
    };

    scan(this.migrationsPath);
    return migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  // ─── Parse SQL UP / DOWN Sections ───────────

  private parseSql(sql: string): { upSQL: string; downSQL: string | null } {
    if (sql.includes("-- UP") && sql.includes("-- DOWN")) {
      const parts = sql.split("-- DOWN");
      return {
        upSQL: parts[0].replace("-- UP", "").trim(),
        downSQL: parts[1].trim(),
      };
    }
    if (sql.includes("-- DOWN")) {
      const parts = sql.split("-- DOWN");
      return { upSQL: parts[0].trim(), downSQL: parts[1].trim() };
    }
    return { upSQL: sql.replace("-- UP", "").trim(), downSQL: null };
  }

  // ─── Execute SQL Statements ──────────────────

  private async executeSQL(sql: string, version: string): Promise<void> {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (let i = 0; i < statements.length; i++) {
      try {
        await this.adapter.query(statements[i] + ";");
      } catch (error) {
        throw new Error(
          `Migration ${version} failed at statement ${i + 1}/${statements.length}:\n` +
            `  ${(error as Error).message}`
        );
      }
    }
  }

  // ─── Get Applied Migrations ──────────────────

  private async getApplied(): Promise<MigrationRecord[]> {
    try {
      const result = await this.adapter.query<MigrationRecord>(
        `SELECT * FROM ${this.tableName} ORDER BY version ASC`
      );
      return result.rows;
    } catch {
      return [];
    }
  }

  // ─── Record / Unrecord ───────────────────────

  private async record(
    version: string,
    name: string,
    executionTime: number,
    filePath: string
  ): Promise<void> {
    const relativePath = path.relative(this.migrationsPath, filePath);
    await this.adapter.query(
      `INSERT INTO ${this.tableName} (version, name, file_path, execution_time)
       VALUES ($1, $2, $3, $4)`,
      [version, name, relativePath, executionTime]
    );
  }

  private async unrecord(version: string): Promise<void> {
    await this.adapter.query(
      `DELETE FROM ${this.tableName} WHERE version = $1`,
      [version]
    );
  }

  // ─────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────

  /**
   * UP — Saari pending migrations run karo
   * Optional: targetVersion tak hi run karo
   *
   * @example
   * await manager.up();           // sab pending
   * await manager.up("003");      // sirf 001, 002, 003 tak
   */
  async up(targetVersion?: string): Promise<void> {
    await this.initialize();

    const all = this.discoverMigrations();
    const applied = await this.getApplied();
    const appliedSet = new Set(applied.map((m) => m.version));

    let count = 0;

    for (const file of all) {
      if (appliedSet.has(file.version)) continue;
      if (targetVersion && file.version > targetVersion) break;

      console.log(`\n⏳ Applying: ${file.version}_${file.name}`);

      const sql = fs.readFileSync(file.filePath, "utf-8");
      const { upSQL } = this.parseSql(sql);

      const start = Date.now();

      await this.adapter.transaction(async () => {
        await this.executeSQL(upSQL, file.version);
      });

      const time = Date.now() - start;
      await this.record(file.version, file.name, time, file.filePath);
      console.log(`✅ Applied: ${file.version}_${file.name} (${time}ms)`);
      count++;
    }

    if (count === 0) {
      console.log("✅ Koi pending migration nahi hai.");
    } else {
      console.log(`\n🎉 ${count} migration(s) successfully applied!`);
    }
  }

  /**
   * DOWN — Rollback karo by steps ya specific version tak
   *
   * @example
   * await manager.down();              // last 1 rollback
   * await manager.down(3);             // last 3 rollback
   * await manager.down(1, "002");      // version 002 tak rollback (002 bhi rollback hoga)
   */
  async down(steps: number = 1, targetVersion?: string): Promise<void> {
    await this.initialize();

    const applied = await this.getApplied();

    if (applied.length === 0) {
      console.log("⚠️  Koi applied migration nahi hai rollback ke liye.");
      return;
    }

    // Target version se rollback — us version tak (inclusive) sab rollback hoga
    let toRollback: MigrationRecord[];

    if (targetVersion) {
      // Applied mein se wo sab jo targetVersion se UPAR hain — reverse order mein
      toRollback = applied
        .filter((m) => m.version >= targetVersion)
        .reverse();

      if (toRollback.length === 0) {
        console.log(`⚠️  Version ${targetVersion} se koi migration nahi mili rollback ke liye.`);
        return;
      }

      console.log(
        `🔄 Rolling back ${toRollback.length} migration(s) to version ${targetVersion}...`
      );
    } else {
      // Steps se rollback
      toRollback = applied.slice(-steps).reverse();
    }

    const all = this.discoverMigrations();
    let count = 0;

    for (const record of toRollback) {
      console.log(`\n⏳ Rolling back: ${record.version}_${record.name}`);

      const file = all.find((m) => m.version === record.version);
      if (!file) {
        console.warn(
          `⚠️  File nahi mili version ${record.version} ke liye — skip kar raha hoon`
        );
        continue;
      }

      const sql = fs.readFileSync(file.filePath, "utf-8");
      const { downSQL } = this.parseSql(sql);

      if (!downSQL) {
        console.warn(
          `⚠️  -- DOWN section nahi hai file mein: ${file.version}_${file.name}`
        );
        continue;
      }

      const start = Date.now();

      await this.adapter.transaction(async () => {
        await this.executeSQL(downSQL, record.version);
      });

      const time = Date.now() - start;
      await this.unrecord(record.version);
      console.log(
        `✅ Rolled back: ${record.version}_${record.name} (${time}ms)`
      );
      count++;
    }

    console.log(`\n🎉 ${count} migration(s) rolled back!`);
  }

  /**
   * RESET — Saari applied migrations rollback karo (fresh start)
   *
   * @example
   * await manager.reset();
   */
  async reset(): Promise<void> {
    await this.initialize();

    const applied = await this.getApplied();

    if (applied.length === 0) {
      console.log("⚠️  Koi applied migration nahi hai reset ke liye.");
      return;
    }

    console.log(`\n🔄 Resetting all ${applied.length} migration(s)...\n`);
    await this.down(applied.length);
    console.log("\n✅ Database reset complete!");
  }

  /**
   * STATUS — Applied aur pending migrations dikhao
   *
   * @example
   * const status = await manager.status();
   */
  async status(): Promise<MigrationStatus> {
    await this.initialize();

    const all = this.discoverMigrations();
    const applied = await this.getApplied();
    const appliedSet = new Set(applied.map((m) => m.version));

    const pending = all
      .filter((m) => !appliedSet.has(m.version))
      .map((m) => `${m.version}_${m.name}`);

    console.log("\n📊 Migration Status:");
    console.log("─────────────────────────────────────────────────");

    if (applied.length === 0 && pending.length === 0) {
      console.log("  ℹ️  Koi migration file nahi mili.");
    }

    if (applied.length > 0) {
      console.log(`\n  ✅ Applied (${applied.length}):`);
      for (const m of applied) {
        const date = new Date(m.applied_at).toLocaleString();
        console.log(`     • [${m.version}] ${m.name} — ${date} (${m.execution_time}ms)`);
      }
    }

    if (pending.length > 0) {
      console.log(`\n  ⏳ Pending (${pending.length}):`);
      for (const p of pending) {
        console.log(`     • ${p}`);
      }
    } else if (applied.length > 0) {
      console.log("\n  🎉 Sab migrations up to date hain!");
    }

    console.log("─────────────────────────────────────────────────\n");

    return { applied, pending };
  }

  /**
   * VERSION — Current (latest applied) version dikhao
   *
   * @example
   * await manager.version();
   */
  async version(): Promise<void> {
    const applied = await this.getApplied();

    if (applied.length === 0) {
      console.log("⚠️  Koi migration apply nahi hui abhi tak.");
      return;
    }

    const latest = applied[applied.length - 1];
    console.log(`\n📌 Current version: [${latest.version}] ${latest.name}`);
    console.log(`   Applied at:       ${new Date(latest.applied_at).toLocaleString()}`);
    console.log(`   Execution time:   ${latest.execution_time}ms`);
    console.log(`   Total applied:    ${applied.length} migration(s)\n`);
  }

  /**
   * VERIFY — Check karo ke sab applied migrations ki files exist karti hain
   *
   * @example
   * await manager.verify();
   */
  async verify(): Promise<void> {
    await this.initialize();

    const applied = await this.getApplied();
    const all = this.discoverMigrations();
    const allVersions = new Set(all.map((m) => m.version));

    console.log("\n🔍 Verifying migrations...\n");

    if (applied.length === 0) {
      console.log("  ℹ️  Koi applied migration nahi hai verify karne ke liye.\n");
      return;
    }

    let issues = 0;

    for (const m of applied) {
      if (!allVersions.has(m.version)) {
        console.warn(`  ❌ File missing: [${m.version}] ${m.name}`);
        issues++;
      } else {
        console.log(`  ✅ OK: [${m.version}] ${m.name}`);
      }
    }

    if (issues === 0) {
      console.log("\n  ✅ Sab migrations verified — koi issue nahi!\n");
    } else {
      console.log(
        `\n  ⚠️  ${issues} issue(s) found — kuch migration files missing hain!\n`
      );
    }
  }

  /**
   * CLEAR HISTORY — Tracking table se sab records delete karo
   * (Actual database tables DELETE nahi hongi — sirf tracking history clear hogi)
   *
   * @example
   * await manager.clearHistory();
   */
  async clearHistory(): Promise<void> {
    await this.initialize();
    await this.adapter.query(`DELETE FROM ${this.tableName}`);
    console.log("✅ Migration history cleared! (Database tables safe hain)");
  }
}