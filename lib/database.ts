import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const DATABASE_NAME = "ji-healthcare.db";
const LATEST_SCHEMA_VERSION = 3;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const migrations: Record<number, string> = {
  3: `
    ALTER TABLE categories
      ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1));

    CREATE INDEX IF NOT EXISTS idx_categories_is_archived
      ON categories (is_archived, id);
  `,
  2: `
    CREATE TABLE IF NOT EXISTS workout_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      goal TEXT NOT NULL,
      environment TEXT NOT NULL,
      minutes INTEGER NOT NULL CHECK (minutes BETWEEN 5 AND 180),
      equipment TEXT NOT NULL
    );
  `,
  1: `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS routine_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      kg REAL,
      set_count INTEGER,
      link TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER,
      category_id INTEGER,
      title TEXT NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_routines_category_id
      ON routines (category_id);
    CREATE INDEX IF NOT EXISTS idx_routine_items_routine_id
      ON routine_items (routine_id);
    CREATE INDEX IF NOT EXISTS idx_records_recorded_at
      ON records (recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_records_category_id
      ON records (category_id);
  `,
};

async function getSchemaVersion(database: SQLite.SQLiteDatabase) {
  const result = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );

  return result?.user_version ?? 0;
}

async function executeTransaction<T>(
  database: SQLite.SQLiteDatabase,
  operation: (transaction: SQLite.SQLiteDatabase) => Promise<T>
) {
  if (Platform.OS === "web") {
    await database.execAsync("BEGIN IMMEDIATE TRANSACTION");

    try {
      const result = await operation(database);
      await database.execAsync("COMMIT");
      return result;
    } catch (error) {
      await database.execAsync("ROLLBACK");
      throw error;
    }
  }

  let result: T | undefined;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    result = await operation(transaction);
  });

  return result as T;
}

async function applyMigrations(database: SQLite.SQLiteDatabase) {
  const currentVersion = await getSchemaVersion(database);

  if (currentVersion > LATEST_SCHEMA_VERSION) {
    throw new Error(
      "앱이 지원하는 데이터베이스 버전보다 높은 스키마가 감지되었습니다."
    );
  }

  for (
    let nextVersion = currentVersion + 1;
    nextVersion <= LATEST_SCHEMA_VERSION;
    nextVersion += 1
  ) {
    const migration = migrations[nextVersion];

    if (!migration) {
      throw new Error(`데이터베이스 마이그레이션 v${nextVersion}이 없습니다.`);
    }

    await executeTransaction(database, async (transaction) => {
      await transaction.execAsync(migration);
      await transaction.execAsync(`PRAGMA user_version = ${nextVersion}`);
    });
  }

  await database.execAsync("PRAGMA foreign_keys = ON");
}

// 앱에서 사용할 로컬 SQLite 파일을 열고 필요한 마이그레이션을 적용합니다.
async function createDatabase() {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync("PRAGMA foreign_keys = ON");
  await applyMigrations(database);

  return database;
}

// 현재 JS 런타임에서 데이터베이스 초기화가 한 번만 실행되도록 보장합니다.
export async function initializeDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase();
  }

  return databasePromise;
}

// 초기화가 끝난 공용 데이터베이스 인스턴스를 반환합니다.
export async function getDatabase() {
  return initializeDatabase();
}

// 여러 쓰기 작업을 하나의 트랜잭션으로 묶고 실패 시 전체를 되돌립니다.
export async function runInTransaction<T>(
  operation: (database: SQLite.SQLiteDatabase) => Promise<T>
) {
  const database = await getDatabase();

  return executeTransaction(database, operation);
}
