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

// 이전 설치의 v2 테이블·외래키를 재현한다.
const version2 = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE routines (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE routine_items (id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    title TEXT NOT NULL, kg REAL, set_count INTEGER, link TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE records (id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER REFERENCES routines(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT, title TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE workout_profile (id INTEGER PRIMARY KEY CHECK (id = 1), goal TEXT NOT NULL,
    environment TEXT NOT NULL, minutes INTEGER NOT NULL CHECK (minutes BETWEEN 5 AND 180), equipment TEXT NOT NULL);
  INSERT INTO categories (id, name) VALUES (1, '하체'), (2, '상체');
  INSERT INTO routines (id, title, category_id) VALUES (1, '기존 루틴', 1);
  INSERT INTO routine_items (routine_id, title, kg, set_count) VALUES (1, '스쿼트', 2.5, 3);
  INSERT INTO records (routine_id, category_id, title, recorded_at) VALUES (1, 1, '기존 기록', '2026-09-01T00:00:00.000Z');
  INSERT INTO workout_profile VALUES (1, '체력 유지', '홈트', 30, '덤벨');
  PRAGMA user_version = 2;
`;

beforeEach(() => {
  jest.resetModules();
  sqlite = new DatabaseSync(":memory:");
  mockDatabase = {
    execAsync: jest.fn(async (sql: string) => { sqlite.exec(sql); }),
    runAsync: jest.fn(async (sql: string, ...params: (string | number | null)[]) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    }),
    getFirstAsync: jest.fn(async (sql: string, ...params: (string | number | null)[]) =>
      sqlite.prepare(sql).get(...params) ?? null),
    getAllAsync: jest.fn(async (sql: string, ...params: (string | number | null)[]) =>
      sqlite.prepare(sql).all(...params)),
  };
});
afterEach(() => { sqlite.close(); });

test("새 설치에 v3를 적용하고 카테고리 기본값을 사용 중으로 저장한다", async () => {
  const { initializeDatabase } = require("@/lib/database");
  const { addCategory, getCategory } = require("@/service/categoryService");
  await initializeDatabase();
  await addCategory("하체");
  expect(sqlite.prepare("PRAGMA user_version").get().user_version).toBe(3);
  expect(sqlite.prepare("SELECT is_archived FROM categories").get().is_archived).toBe(0);
  await expect(getCategory()).resolves.toEqual([{ id: "1", name: "하체" }]);
  await expect(getCategory(true)).resolves.toEqual([]);
});

test("v2 업그레이드·보관·재시작·복원 후 기존 루틴과 기록·설정을 보존한다", async () => {
  sqlite.exec(version2);
  let categories = require("@/service/categoryService");
  const { getRoutineDetail } = require("@/service/routineService");
  const { getRecord } = require("@/service/recordService");
  const snapshot = () => ["routines", "routine_items", "records", "workout_profile"]
    .map((table) => sqlite.prepare(`SELECT * FROM ${table}`).all());
  const original = snapshot();
  await categories.setCategoryArchived("1", true);
  expect(sqlite.prepare("PRAGMA user_version").get().user_version).toBe(3);
  await expect(categories.getCategory()).resolves.toEqual([{ id: "2", name: "상체" }]);
  await expect(categories.getCategory(true)).resolves.toEqual([{ id: "1", name: "하체" }]);
  expect((await getRoutineDetail("1")).category).toBe("하체");
  expect((await getRecord())[0].category).toBe("하체");
  jest.resetModules();
  categories = require("@/service/categoryService");
  await expect(categories.getCategory(true)).resolves.toEqual([{ id: "1", name: "하체" }]);
  await categories.setCategoryArchived("1", false);
  expect(await categories.getCategory()).toHaveLength(2);
  expect(snapshot()).toEqual(original);
});

test("v3 마이그레이션 실패 시 열 추가와 버전 변경을 함께 롤백한다", async () => {
  sqlite.exec(version2);
  mockDatabase.execAsync.mockImplementation(async (sql: string) => {
    if (sql === "PRAGMA user_version = 3") throw new Error("버전 저장 실패");
    sqlite.exec(sql);
  });
  const { initializeDatabase } = require("@/lib/database");
  await expect(initializeDatabase()).rejects.toThrow("버전 저장 실패");
  expect(sqlite.prepare("PRAGMA user_version").get().user_version).toBe(2);
  expect(sqlite.prepare("PRAGMA table_info(categories)").all().map((column: { name: string }) => column.name))
    .not.toContain("is_archived");
  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
});

test("연결된 데이터는 영구 삭제를 막고 빈 카테고리는 삭제할 수 있다", async () => {
  sqlite.exec(version2);
  const { deleteCategory, setCategoryArchived, getCategory } = require("@/service/categoryService");
  await expect(deleteCategory("2")).rejects.toThrow("먼저 보관");
  await setCategoryArchived("1", true);
  await expect(deleteCategory("1")).rejects.toThrow("보관");
  await setCategoryArchived("2", true);
  await deleteCategory("2");
  await expect(getCategory()).resolves.toEqual([]);
  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM records").get().count).toBe(1);
});

test("보관 중인 이름 중복 등록은 복원 경로를 안내한다", async () => {
  sqlite.exec(version2);
  const { setCategoryArchived, addCategory } = require("@/service/categoryService");
  await setCategoryArchived("1", true);
  await expect(addCategory("하체")).rejects.toThrow("복원");
});

test("보관 카테고리로 새 루틴 등록·재분류는 막고 기존 분류 유지는 허용한다", async () => {
  sqlite.exec(version2);
  const { setCategoryArchived } = require("@/service/categoryService");
  const { addRoutine, getRoutineDetail, updateRoutineService } = require("@/service/routineService");
  await setCategoryArchived("1", true);
  const existing = await getRoutineDetail("1");
  await expect(addRoutine(existing)).rejects.toThrow("보관");
  await updateRoutineService({ ...existing, title: "수정된 루틴" });
  expect((await getRoutineDetail("1")).categoryId).toBe(1);
  await updateRoutineService({ ...existing, categoryId: 2 });
  await expect(updateRoutineService(existing)).rejects.toThrow("보관");
  expect((await getRoutineDetail("1")).categoryId).toBe(2);
  expect(sqlite.prepare("SELECT COUNT(*) AS count FROM routine_items").get().count).toBe(1);
});

test.each(["0", "-1", "1.5", "abc", "999"])("잘못되거나 없는 카테고리 %s의 보관을 거부한다", async (id) => {
  sqlite.exec(version2);
  const { setCategoryArchived } = require("@/service/categoryService");
  await expect(setCategoryArchived(id, true)).rejects.toThrow();
});
