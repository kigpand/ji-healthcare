import { objectSchema, stringSchema } from "ji-type-schema";

const categoryNameSchema = stringSchema().refine(
  (value) => value.trim().length > 0,
  "카테고리 이름을 입력해주세요.",
  "required"
);

export const categoryRequestSchema = objectSchema({
  category: categoryNameSchema,
});

type RawCategoryRequestType = {
  category?: unknown;
};

export function normalizeCategoryRequestInput(input: RawCategoryRequestType) {
  const category =
    typeof input.category === "string" ? input.category.trim() : "";

  return { category };
}

export function validateCategoryRequestInput(input: RawCategoryRequestType) {
  const normalized = normalizeCategoryRequestInput(input);
  const result = categoryRequestSchema.safeParse(normalized);

  if (!result.success) {
    return {
      success: false as const,
      errors: result.errors,
      message: result.errors[0]?.message,
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}
