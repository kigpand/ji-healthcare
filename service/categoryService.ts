import { getDatabase } from "@/lib/database";
import { validateCategoryRequestInput } from "@/schema/category.schema";

type CategoryRow = {
  id: number;
  name: string;
};

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
      throw new Error("이미 같은 이름의 카테고리가 있습니다.");
    }

    throw error;
  }

  return true;
}

export async function deleteCategory(categoryId: string) {
  const numericCategoryId = Number(categoryId);

  if (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0) {
    throw new Error("삭제할 카테고리 정보가 올바르지 않습니다.");
  }

  const db = await getDatabase();
  const [routineCountRow, recordCountRow] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM routines WHERE category_id = ?",
      numericCategoryId
    ),
    db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM records WHERE category_id = ?",
      numericCategoryId
    ),
  ]);
  const routineCount = routineCountRow?.count ?? 0;
  const recordCount = recordCountRow?.count ?? 0;

  if (routineCount > 0 || recordCount > 0) {
    throw new Error(
      "이 카테고리를 사용하는 루틴 또는 기록이 있어 삭제할 수 없습니다. 관련 데이터를 먼저 정리해주세요."
    );
  }

  const result = await db.runAsync(
    "DELETE FROM categories WHERE id = ?",
    numericCategoryId
  );

  if ((result.changes ?? 0) === 0) {
    throw new Error("삭제할 카테고리를 찾지 못했습니다.");
  }

  return true;
}

export async function getCategory() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    "SELECT id, name FROM categories ORDER BY id ASC"
  );

  return rows.map((row) => ({
    id: row.id.toString(),
    name: row.name,
  }));
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("unique constraint failed")
  );
}
