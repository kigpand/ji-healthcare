import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const DATABASE_NAME = "ji-healthcare.db";
const LATEST_SCHEMA_VERSION = 6;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const migrations: Record<number, string> = {
  6: `
    UPDATE routine_items
    SET set_count =
      CAST(set_count AS INTEGER) +
      (set_count > CAST(set_count AS INTEGER))
    WHERE set_count > 0
      AND set_count != CAST(set_count AS INTEGER);

    UPDATE routine_items
    SET kg = 0
    WHERE kg IS NOT NULL
      AND (
        typeof(kg) NOT IN ('integer', 'real')
        OR kg < 0
        OR kg > 1.7976931348623157e308
      );

    UPDATE record_items
    SET set_count =
      CAST(set_count AS INTEGER) +
      (set_count > CAST(set_count AS INTEGER))
    WHERE set_count > 0
      AND set_count != CAST(set_count AS INTEGER);

    UPDATE record_items
    SET kg = 0
    WHERE typeof(kg) NOT IN ('integer', 'real')
      OR kg < 0
      OR kg > 1.7976931348623157e308;

    CREATE TABLE IF NOT EXISTS record_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_item_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL
        CHECK (typeof(set_number) = 'integer' AND set_number > 0),
      kg REAL NOT NULL CHECK (
        typeof(kg) IN ('integer', 'real')
        AND kg >= 0
        AND kg <= 1.7976931348623157e308
      ),
      FOREIGN KEY (record_item_id) REFERENCES record_items(id) ON DELETE CASCADE,
      UNIQUE (record_item_id, set_number)
    );

    WITH RECURSIVE completed_sets (
      record_item_id,
      set_number,
      kg,
      set_count
    ) AS (
      SELECT id, 1, kg, set_count
      FROM record_items
      UNION ALL
      SELECT record_item_id, set_number + 1, kg, set_count
      FROM completed_sets
      WHERE set_number < set_count
    )
    INSERT OR IGNORE INTO record_sets (record_item_id, set_number, kg)
    SELECT record_item_id, set_number, kg
    FROM completed_sets;
  `,
  5: `
    UPDATE routine_items
    SET set_count = 1
    WHERE set_count IS NULL OR set_count <= 0;
  `,
  4: `
    CREATE TABLE IF NOT EXISTS record_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      kg REAL NOT NULL CHECK (kg >= 0),
      set_count INTEGER NOT NULL CHECK (set_count > 0),
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_record_items_record_id
      ON record_items (record_id, sort_order);
  `,
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

  const transaction = await SQLite.openDatabaseAsync(DATABASE_NAME, {
    useNewConnection: true,
  });
  let transactionStarted = false;

  try {
    await transaction.execAsync("PRAGMA foreign_keys = ON");
    await transaction.execAsync("BEGIN IMMEDIATE TRANSACTION");
    transactionStarted = true;

    const result = await operation(transaction);
    await transaction.execAsync("COMMIT");
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await transaction.execAsync("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to rollback SQLite transaction", rollbackError);
      }
    }

    throw error;
  } finally {
    try {
      await transaction.closeAsync();
    } catch (closeError) {
      console.error("Failed to close SQLite transaction", closeError);
    }
  }
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
