export interface DatabaseAdapter {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: T[] }>;

  transaction<T>(fn: () => Promise<T>): Promise<T>;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

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
