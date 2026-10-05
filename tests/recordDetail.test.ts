/** @jest-environment node */

const { DatabaseSync } = require("node:sqlite");

let sqlite: InstanceType<typeof DatabaseSync>;
let mockDatabase: {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
};

jest.mock("react-native", () => ({ Platform: { OS: "web" } }));
jest.mock("expo-sqlite", () => ({ openDatabaseAsync: async () => mockDatabase }));

const version3 = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1))
  );
  CREATE TABLE routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE routine_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    kg REAL,
    set_count INTEGER,
    link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER REFERENCES routines(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE workout_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    goal TEXT NOT NULL,
    environment TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes BETWEEN 5 AND 180),
    equipment TEXT NOT NULL
  );
  INSERT INTO categories (id, name) VALUES (1, '하체');
  INSERT INTO routines (id, title, category_id) VALUES (1, '하체 루틴', 1);
  INSERT INTO routine_items
    (routine_id, title, kg, set_count, sort_order)
    VALUES (1, '스쿼트', 20, 3, 0);
  INSERT INTO records
    (id, routine_id, category_id, title, recorded_at)
    VALUES (1, 1, 1, '이전 기록', '2026-09-01T00:00:00.000Z');
  PRAGMA user_version = 3;
`;

beforeEach(() => {
  jest.resetModules();
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(version3);
  mockDatabase = {
    execAsync: jest.fn(async (sql: string) => {
      sqlite.exec(sql);
    }),
    runAsync: jest.fn(
      async (sql: string, ...params: (string | number | null)[]) => {
        const result = sqlite.prepare(sql).run(...params);
        return {
          changes: Number(result.changes),
          lastInsertRowId: Number(result.lastInsertRowid),
        };
      }
    ),
    getFirstAsync: jest.fn(
      async (sql: string, ...params: (string | number | null)[]) =>
        sqlite.prepare(sql).get(...params) ?? null
    ),
    getAllAsync: jest.fn(
      async (sql: string, ...params: (string | number | null)[]) =>
        sqlite.prepare(sql).all(...params)
    ),
  };
});

afterEach(() => {
  sqlite.close();
});

test("v3 기록을 보존하며 v4 상세 기록 테이블을 추가한다", async () => {
  const { initializeDatabase } = require("@/lib/database");
  const { getRecordDetail } = require("@/service/recordService");

  await initializeDatabase();

  expect(sqlite.prepare("PRAGMA user_version").get().user_version).toBe(7);
  await expect(getRecordDetail("1")).resolves.toMatchObject({
    id: 1,
    title: "이전 기록",
    items: [],
  });
});

test("기존 루틴의 비어 있는 세트 수를 보정해 완료 기록을 저장한다", async () => {
  sqlite.prepare("UPDATE routine_items SET set_count = NULL WHERE id = 1").run();
  sqlite
    .prepare(
      `INSERT INTO routine_items
        (routine_id, title, kg, set_count, sort_order)
       VALUES (1, '런지', 10, 0, 1)`
    )
    .run();
  sqlite
    .prepare(
      `INSERT INTO routine_items
        (routine_id, title, kg, set_count, sort_order)
       VALUES (1, '레그 프레스', '잘못된 무게', 1.5, 2)`
    )
    .run();
  const { initializeDatabase } = require("@/lib/database");
  const { getRoutineDetail } = require("@/service/routineService");
  const { addRecord, getRecordDetail } = require("@/service/recordService");

  await initializeDatabase();

  const routine = await getRoutineDetail("1");
  expect(
    routine.routine.map((item: { set: number }) => item.set)
  ).toEqual([1, 1, 2]);

  await addRecord({
    ...routine,
    routine: routine.routine.map((item: { set: number; kg: number }) => ({
      ...item,
      setKgs: Array.from({ length: item.set }, () => item.kg),
      setReps: Array.from({ length: item.set }, () => null),
    })),
  });
  await expect(getRecordDetail("2")).resolves.toMatchObject({
    items: [
      { title: "스쿼트", kg: 20, set: 1 },
      { title: "런지", kg: 10, set: 1 },
      {
        title: "레그 프레스",
        kg: 0,
        set: 2,
        sets: [
          { setNumber: 1, kg: 0 },
          { setNumber: 2, kg: 0 },
        ],
      },
    ],
  });
});

test("운동 완료 시 항목을 저장해 이후 루틴 변경과 관계없이 조회한다", async () => {
  const { addRecord, getRecordDetail } = require("@/service/recordService");

  await addRecord({
    id: 1,
    title: "하체 루틴",
    categoryId: 1,
    category: "하체",
    createdAt: "2026-09-01T00:00:00.000Z",
    routine: [
      {
        title: "스쿼트",
        kg: 22.5,
        set: 3,
        setKgs: [20, 22.5, 25],
        setReps: [12, 10, 8],
      },
      {
        title: "런지",
        kg: 10,
        set: 2,
        setKgs: [10, 12],
        setReps: [null, 10],
      },
    ],
  });

  sqlite
    .prepare("UPDATE routine_items SET title = ?, kg = ?, set_count = ? WHERE id = 1")
    .run("수정된 스쿼트", 30, 5);

  await expect(getRecordDetail("2")).resolves.toMatchObject({
    title: "하체 루틴",
    category: "하체",
    items: [
      {
        title: "스쿼트",
        kg: 22.5,
        set: 3,
        sortOrder: 0,
        sets: [
          { setNumber: 1, kg: 20, reps: 12 },
          { setNumber: 2, kg: 22.5, reps: 10 },
          { setNumber: 3, kg: 25, reps: 8 },
        ],
      },
      {
        title: "런지",
        kg: 10,
        set: 2,
        sortOrder: 1,
        sets: [
          { setNumber: 1, kg: 10, reps: null },
          { setNumber: 2, kg: 12, reps: 10 },
        ],
      },
    ],
  });
});

test("v5 완료 기록의 분수형 세트 수를 올림하고 세트별 스냅샷으로 보존한다", async () => {
  sqlite.exec(`
    CREATE TABLE record_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      kg REAL NOT NULL CHECK (kg >= 0),
      set_count INTEGER NOT NULL CHECK (set_count > 0),
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO record_items
      (id, record_id, title, kg, set_count, sort_order)
      VALUES (1, 1, '스쿼트', 20, 1.5, 0);
    INSERT INTO record_items
      (id, record_id, title, kg, set_count, sort_order)
      VALUES (2, 1, '레거시 운동', '잘못된 무게', 1, 1);
    PRAGMA user_version = 5;
  `);
  const { initializeDatabase } = require("@/lib/database");
  const { getRecordDetail } = require("@/service/recordService");

  await initializeDatabase();

  expect(sqlite.prepare("PRAGMA user_version").get().user_version).toBe(7);
  await expect(getRecordDetail("1")).resolves.toMatchObject({
    items: [
      {
        title: "스쿼트",
        set: 2,
        sets: [
          { setNumber: 1, kg: 20, reps: null },
          { setNumber: 2, kg: 20, reps: null },
        ],
      },
      {
        title: "레거시 운동",
        kg: 0,
        sets: [{ setNumber: 1, kg: 0 }],
      },
    ],
  });
});

test("상세 항목 저장 실패 시 기록 본문도 함께 롤백한다", async () => {
  const originalRun = mockDatabase.runAsync.getMockImplementation()!;
  mockDatabase.runAsync.mockImplementation(
    async (sql: string, ...params: (string | number | null)[]) => {
      if (sql.includes("INSERT INTO record_items")) {
        throw new Error("항목 저장 실패");
      }
      return originalRun(sql, ...params);
    }
  );
  const { addRecord } = require("@/service/recordService");

  await expect(
    addRecord({
      id: 1,
      title: "하체 루틴",
      categoryId: 1,
      category: "하체",
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{
        title: "스쿼트",
        kg: 20,
        set: 3,
        setKgs: [20, 20, 20],
        setReps: [null, null, null],
      }],
    })
  ).rejects.toThrow("항목 저장 실패");

  expect(
    sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count
  ).toBe(1);
});

test("분수형 세트 수인 완료 운동은 저장 전에 거부한다", async () => {
  const { addRecord } = require("@/service/recordService");

  await expect(
    addRecord({
      id: 1,
      title: "하체 루틴",
      categoryId: 1,
      category: "하체",
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{
        title: "스쿼트",
        kg: 20,
        set: 1.5,
        setKgs: [20],
        setReps: [null],
      }],
    })
  ).rejects.toThrow("완료 운동의 세트 수가 올바르지 않습니다.");

  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
});

test.each([
  ["세트 수와 다른 개수", [20]],
  ["유효하지 않은 값", [20, Number.NaN]],
])("%s의 세트별 무게는 저장 전에 거부한다", async (_, setKgs) => {
  const { addRecord } = require("@/service/recordService");

  await expect(
    addRecord({
      id: 1,
      title: "하체 루틴",
      categoryId: 1,
      category: "하체",
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{
        title: "스쿼트",
        kg: 20,
        set: 2,
        setKgs,
        setReps: [null, null],
      }],
    })
  ).rejects.toThrow("완료 운동의 세트별 무게가 올바르지 않습니다.");

  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
});

test.each([
  ["세트 수와 다른 개수", [10]],
  ["0", [10, 0]],
  ["분수", [10, 1.5]],
  ["안전한 정수 범위를 벗어난 값", [10, Number.MAX_SAFE_INTEGER + 1]],
])("%s인 세트별 반복 횟수는 저장 전에 거부한다", async (_, setReps) => {
  const { addRecord } = require("@/service/recordService");

  await expect(
    addRecord({
      id: 1,
      title: "하체 루틴",
      categoryId: 1,
      category: "하체",
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{
        title: "스쿼트",
        kg: 20,
        set: 2,
        setKgs: [20, 20],
        setReps,
      }],
    })
  ).rejects.toThrow("완료 운동의 세트별 반복 횟수가 올바르지 않습니다.");

  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
});

test("세트별 무게 스냅샷 저장 실패 시 완료 기록 전체를 롤백한다", async () => {
  const originalRun = mockDatabase.runAsync.getMockImplementation()!;
  mockDatabase.runAsync.mockImplementation(
    async (sql: string, ...params: (string | number | null)[]) => {
      if (sql.includes("INSERT INTO record_sets")) {
        throw new Error("세트 저장 실패");
      }
      return originalRun(sql, ...params);
    }
  );
  const { addRecord } = require("@/service/recordService");

  await expect(
    addRecord({
      id: 1,
      title: "하체 루틴",
      categoryId: 1,
      category: "하체",
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{
        title: "스쿼트",
        kg: 20,
        set: 3,
        setKgs: [20, 20, 20],
        setReps: [null, null, null],
      }],
    })
  ).rejects.toThrow("세트 저장 실패");

  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
  expect(
    sqlite.prepare("SELECT COUNT(*) AS count FROM record_items").get().count
  ).toBe(0);
  expect(
    sqlite.prepare("SELECT COUNT(*) AS count FROM record_sets").get().count
  ).toBe(0);
});

test.each(["", "0", "-1", "1.5", "abc"])(
  "잘못된 기록 ID %p의 상세 조회를 거부한다",
  async (recordId) => {
    const { getRecordDetail } = require("@/service/recordService");
    await expect(getRecordDetail(recordId)).rejects.toThrow(
      "운동 기록 정보가 올바르지 않습니다."
    );
  }
);
