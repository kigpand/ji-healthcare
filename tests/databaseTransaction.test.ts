const events: string[] = [];
const mockOpenDatabaseAsync = jest.fn();
let mockUserVersion = 5;

const transactionDatabase = {
  execAsync: jest.fn(async (sql: string) => {
    events.push(sql);
  }),
  closeAsync: jest.fn(async () => {
    events.push("CLOSE");
  }),
};

const mainDatabase = {
  execAsync: jest.fn(async () => undefined),
  getFirstAsync: jest.fn(async () => ({ user_version: mockUserVersion })),
  withExclusiveTransactionAsync: jest.fn(
    async (operation: (database: typeof transactionDatabase) => Promise<void>) =>
      operation(transactionDatabase)
  ),
};

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("expo-sqlite", () => ({ openDatabaseAsync: mockOpenDatabaseAsync }));

beforeEach(() => {
  jest.resetModules();
  events.length = 0;
  mockUserVersion = 5;
  mockOpenDatabaseAsync.mockReset();
  mockOpenDatabaseAsync
    .mockResolvedValueOnce(mainDatabase)
    .mockResolvedValue(transactionDatabase);
  transactionDatabase.execAsync.mockReset();
  transactionDatabase.execAsync.mockImplementation(async (sql: string) => {
    events.push(sql);
  });
  transactionDatabase.closeAsync.mockReset();
  transactionDatabase.closeAsync.mockImplementation(async () => {
    events.push("CLOSE");
  });
  mainDatabase.execAsync.mockClear();
  mainDatabase.getFirstAsync.mockClear();
  mainDatabase.withExclusiveTransactionAsync.mockClear();
});

test("네이티브 트랜잭션은 외래 키를 활성화한 별도 연결에서 실행한다", async () => {
  const { runInTransaction } = require("@/lib/database");

  await expect(
    runInTransaction(async (database: typeof transactionDatabase) => {
      expect(database).toBe(transactionDatabase);
      events.push("OPERATION");
      return "완료";
    })
  ).resolves.toBe("완료");

  expect(mockOpenDatabaseAsync).toHaveBeenNthCalledWith(2, "ji-healthcare.db", {
    useNewConnection: true,
  });
  expect(events).toEqual([
    "PRAGMA foreign_keys = ON",
    "BEGIN IMMEDIATE TRANSACTION",
    "OPERATION",
    "COMMIT",
    "CLOSE",
  ]);
});

test("네이티브 트랜잭션 실패 시 롤백하고 별도 연결을 닫는다", async () => {
  const { runInTransaction } = require("@/lib/database");

  await expect(
    runInTransaction(async () => {
      events.push("OPERATION");
      throw new Error("저장 실패");
    })
  ).rejects.toThrow("저장 실패");

  expect(events).toEqual([
    "PRAGMA foreign_keys = ON",
    "BEGIN IMMEDIATE TRANSACTION",
    "OPERATION",
    "ROLLBACK",
    "CLOSE",
  ]);
});

test("커밋 후 연결 종료 실패는 저장 성공 결과를 바꾸지 않는다", async () => {
  const closeError = new Error("연결 종료 실패");
  const consoleError = jest.spyOn(console, "error").mockImplementation();
  transactionDatabase.closeAsync.mockImplementationOnce(async () => {
    events.push("CLOSE");
    throw closeError;
  });
  const { runInTransaction } = require("@/lib/database");

  await expect(runInTransaction(async () => "완료")).resolves.toBe("완료");

  expect(consoleError).toHaveBeenCalledWith(
    "Failed to close SQLite transaction",
    closeError
  );
  consoleError.mockRestore();
});

test("롤백과 연결 종료가 실패해도 최초 작업 오류를 보존한다", async () => {
  const operationError = new Error("저장 실패");
  const consoleError = jest.spyOn(console, "error").mockImplementation();
  transactionDatabase.execAsync.mockImplementation(async (sql: string) => {
    events.push(sql);
    if (sql === "ROLLBACK") {
      throw new Error("롤백 실패");
    }
  });
  transactionDatabase.closeAsync.mockImplementationOnce(async () => {
    events.push("CLOSE");
    throw new Error("연결 종료 실패");
  });
  const { runInTransaction } = require("@/lib/database");

  await expect(
    runInTransaction(async () => {
      throw operationError;
    })
  ).rejects.toBe(operationError);

  expect(consoleError).toHaveBeenCalledTimes(2);
  consoleError.mockRestore();
});

test("네이티브 초기화의 모든 마이그레이션을 외래 키 연결에서 실행한다", async () => {
  mockUserVersion = 0;
  const { initializeDatabase } = require("@/lib/database");

  await initializeDatabase();

  expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(6);
  expect(events.filter((event) => event === "PRAGMA foreign_keys = ON")).toHaveLength(5);
  expect(events.filter((event) => event === "BEGIN IMMEDIATE TRANSACTION")).toHaveLength(5);
  expect(events.filter((event) => event === "COMMIT")).toHaveLength(5);
  expect(events.filter((event) => event === "CLOSE")).toHaveLength(5);
  for (let version = 1; version <= 5; version += 1) {
    expect(events).toContain(`PRAGMA user_version = ${version}`);
  }
});
