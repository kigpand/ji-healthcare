import { getDatabase } from "@/lib/database";
import { validateCategoryRequestInput } from "@/schema/category.schema";

type CategoryRow = {
  id: number;
  name: string;
};

function parseCategoryId(categoryId: string, action: string) {
  const numericCategoryId = Number(categoryId);

  if (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0) {
    throw new Error(`${action} 카테고리 정보가 올바르지 않습니다.`);
  }

  return numericCategoryId;
}

export async function addCategory(name: string) {
  const validated = validateCategoryRequestInput({ category: name });
  if (!validated.success) {
    throw new Error(validated.message ?? "카테고리 입력값을 확인해주세요.");
  }

  const db = await getDatabase();

  try {
    await db.runAsync(
      "INSERT INTO categories (name) VALUES (?)",
      validated.data.category
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const archived = await db.getFirstAsync<{ is_archived: number }>(
        "SELECT is_archived FROM categories WHERE name = ?",
        validated.data.category
      );
      if (archived?.is_archived === 1) {
        throw new Error("보관된 같은 이름의 카테고리가 있습니다. 보관 목록에서 복원해주세요.");
      }
      throw new Error("이미 같은 이름의 카테고리가 있습니다.");
    }

    throw error;
  }

  return true;
}

export async function deleteCategory(categoryId: string) {
  const numericCategoryId = parseCategoryId(categoryId, "삭제할");

  const db = await getDatabase();
  const [categoryRow, routineCountRow, recordCountRow] = await Promise.all([
    db.getFirstAsync<{ is_archived: number }>(
      "SELECT is_archived FROM categories WHERE id = ?",
      numericCategoryId
    ),
    db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM routines WHERE category_id = ?",
      numericCategoryId
    ),
    db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM records WHERE category_id = ?",
      numericCategoryId
    ),
  ]);

  if (!categoryRow) {
    throw new Error("삭제할 카테고리를 찾지 못했습니다.");
  }
  if (categoryRow.is_archived !== 1) {
    throw new Error("카테고리를 먼저 보관한 뒤 삭제해주세요.");
  }

  const routineCount = routineCountRow?.count ?? 0;
  const recordCount = recordCountRow?.count ?? 0;

  if (routineCount > 0 || recordCount > 0) {
    throw new Error(
      "이 카테고리를 사용하는 루틴 또는 기록이 있어 삭제할 수 없습니다. 카테고리를 보관해주세요."
    );
  }

  await db.runAsync(
    "DELETE FROM categories WHERE id = ?",
    numericCategoryId
  );

  return true;
}

export async function setCategoryArchived(categoryId: string, archived: boolean) {
  const numericCategoryId = parseCategoryId(categoryId, archived ? "보관할" : "복원할");
  const db = await getDatabase();
  const result = await db.runAsync(
    "UPDATE categories SET is_archived = ? WHERE id = ?",
    archived ? 1 : 0,
    numericCategoryId
  );

  if ((result.changes ?? 0) === 0) {
    throw new Error(`${archived ? "보관할" : "복원할"} 카테고리를 찾지 못했습니다.`);
  }

  return true;
}

export async function getCategory(archivedOnly = false) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    `SELECT id, name FROM categories
     WHERE is_archived = ?
     ORDER BY id ASC`,
    archivedOnly ? 1 : 0
  );

  return rows.map((row) => ({
    id: row.id.toString(),
    name: row.name,
  }));
}

function isUniqueConstraintError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("unique constraint failed");
}
