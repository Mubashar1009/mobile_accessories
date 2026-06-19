#!/usr/bin/env node

/**
 * migrate-cli — Custom Migration CLI
 *
 * Usage:
 *   npx tsx src/lib/migrate.ts up
 *   npx tsx src/lib/migrate.ts up 003               # sirf 003 tak
 *   npx tsx src/lib/migrate.ts down                 # last 1 rollback
 *   npx tsx src/lib/migrate.ts down --steps 3       # last 3 rollback
 *   npx tsx src/lib/migrate.ts down --to 002        # version 002 tak rollback
 *   npx tsx src/lib/migrate.ts reset                # sab rollback
 *   npx tsx src/lib/migrate.ts status
 *   npx tsx src/lib/migrate.ts version
 *   npx tsx src/lib/migrate.ts verify
 *   npx tsx src/lib/migrate.ts create my_table
 *   npx tsx src/lib/migrate.ts history:clear
 */


import { MigrationManager } from "@/db/migrationmanager";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const command = args[0];

// ─── Helper: nayi migration file banao ──────────

function createMigration(name: string): void {
  const migrationsDir = path.resolve("./migrations");

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log("📁 migrations/ folder create kiya");
  }

  // Timestamp-based version: YYYYMMDDHHMMSS
  const now = new Date();
  const version = now
    .toISOString()
    .replace(/[-T:Z.]/g, "")
    .slice(0, 14);

  const safeName = name.replace(/\s+/g, "_").toLowerCase();
  const fileName = `${version}_${safeName}.sql`;
  const filePath = path.join(migrationsDir, fileName);

  const template = `-- UP
-- Yahan apna SQL likho

CREATE TABLE IF NOT EXISTS ${safeName} (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMP DEFAULT NOW()
);


-- DOWN
-- Yahan rollback SQL likho

DROP TABLE IF EXISTS ${safeName};
`;

  fs.writeFileSync(filePath, template, "utf-8");
  console.log(`\n✅ Migration file bani:\n   migrations/${fileName}\n`);
}

// ─── Helper: manager banao aur run karo ─────────

async function run(
  fn: (manager: MigrationManager) => Promise<void>
): Promise<void> {
  const manager = new MigrationManager();
  try {
    await manager.connect();
    await fn(manager);
  } catch (error) {
    console.error(`\n❌ Error: ${(error as Error).message}\n`);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
}

// ─── Flag helpers ────────────────────────────────

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

// ─── Command Router ──────────────────────────────

async function main() {
  switch (command) {

    // ── UP ──────────────────────────────────────────
    case "up":
      await run(async (m) => {
        const targetVersion = args[1]; // optional
        if (targetVersion) {
          console.log(`\n🚀 Running migrations up to version: ${targetVersion}\n`);
        } else {
          console.log("\n🚀 Running all pending migrations...\n");
        }
        await m.up(targetVersion);
      });
      break;

    // ── DOWN ─────────────────────────────────────────
    case "down":
      await run(async (m) => {
        const toVersion = getFlag("--to");
        const stepsStr = getFlag("--steps");
        const steps = stepsStr ? parseInt(stepsStr) : 1;

        if (toVersion) {
          console.log(`\n⏪ Rolling back to version: ${toVersion}\n`);
          await m.down(1, toVersion);
        } else {
          console.log(`\n⏪ Rolling back last ${steps} migration(s)...\n`);
          await m.down(steps);
        }
      });
      break;

    // ── RESET ────────────────────────────────────────
    case "reset":
      await run(async (m) => {
        console.log("\n⚠️  Saari migrations rollback ho rahi hain...\n");
        await m.reset();
      });
      break;

    // ── STATUS ───────────────────────────────────────
    case "status":
      await run(async (m) => {
        await m.status();
      });
      break;

    // ── VERSION ──────────────────────────────────────
    case "version":
      await run(async (m) => {
        await m.version();
      });
      break;

    // ── VERIFY ───────────────────────────────────────
    case "verify":
      await run(async (m) => {
        await m.verify();
      });
      break;

    // ── CREATE ───────────────────────────────────────
    case "create":
      const migrationName = args.slice(1).join("_");
      if (!migrationName) {
        console.error(
          "\n❌ Migration ka naam do!\n" +
            "   Example: npx tsx src/lib/migrate.ts create create_users_table\n"
        );
        process.exit(1);
      }
      createMigration(migrationName);
      break;

    // ── HISTORY:CLEAR ────────────────────────────────
    case "history:clear":
      await run(async (m) => {
        await m.clearHistory();
      });
      break;

    // ── HELP / DEFAULT ───────────────────────────────
    default:
      console.log(`
🗄️  Migration CLI — Available Commands
═══════════════════════════════════════════════════

  MIGRATE UP
  ──────────────────────────────────────────────
  up                        Saari pending migrations run karo
  up <version>              Specific version TAK run karo
                            e.g. up 003

  ROLLBACK
  ──────────────────────────────────────────────
  down                      Last 1 migration rollback karo
  down --steps <n>          Last N migrations rollback karo
  down --to <version>       Kisi bhi version TAK rollback karo
                            e.g. down --to 002

  RESET
  ──────────────────────────────────────────────
  reset                     Saari migrations rollback karo (fresh start)

  INFO
  ──────────────────────────────────────────────
  status                    Applied aur pending migrations dekho
  version                   Current version dekho
  verify                    Check karo ke sab migration files exist karti hain

  CREATE
  ──────────────────────────────────────────────
  create <name>             Nayi migration file banao
                            e.g. create add_posts_table

  HISTORY
  ──────────────────────────────────────────────
  history:clear             Tracking history clear karo (DB safe rahega)

═══════════════════════════════════════════════════
`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});