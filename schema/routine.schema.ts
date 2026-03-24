import {
  arraySchema,
  numberSchema,
  objectSchema,
  stringSchema,
} from "ji-type-schema";

const youtubeRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}([&?=#/\w-]*)?$/i;

const titleSchema = stringSchema().refine(
  (value) => value.trim().length > 0,
  "운동 이름을 입력해주세요.",
  "required"
);

const routineNameSchema = stringSchema().refine(
  (value) => value.trim().length > 0,
  "루틴 이름을 입력해주세요.",
  "required"
);

const categoryIdSchema = numberSchema().refine(
  (value) => Number.isInteger(value) && value > 0,
  "카테고리를 선택해주세요.",
  "invalid_number"
);

const setCountSchema = numberSchema().refine(
  (value) => Number.isInteger(value) && value > 0,
  "횟수는 1 이상의 정수여야 합니다.",
  "invalid_number"
);

const kgSchema = numberSchema().refine(
  (value) => Number.isFinite(value) && value >= 0,
  "무게는 0 이상의 숫자여야 합니다.",
  "invalid_number"
);

const youtubeLinkSchema = stringSchema()
  .refine(
    (value) => youtubeRegex.test(value.trim()),
    "링크가 올바른 유튜브 주소인지 확인해주세요.",
    "invalid_link"
  )
  .optional();

export const routineDataSchema = objectSchema({
  kg: kgSchema,
  set: setCountSchema,
  title: titleSchema,
  link: youtubeLinkSchema,
});

export const routineInfoSchema = objectSchema({
  id: numberSchema(),
  title: routineNameSchema,
  category: stringSchema(),
  categoryId: numberSchema().nullable(),
  createdAt: stringSchema(),
  routine: arraySchema(routineDataSchema),
});

export const routineSchema = objectSchema({
  routines: arraySchema(routineInfoSchema),
});

export const routineRequestSchema = objectSchema({
  title: routineNameSchema,
  categoryId: categoryIdSchema,
  routine: arraySchema(routineDataSchema),
});

type RoutineSetType = {
  title?: unknown;
  set?: unknown;
  kg?: unknown;
  link?: unknown;
};

type RoutineRequestType = {
  title?: unknown;
  categoryId?: unknown;
  routine?: unknown;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return Number.NaN;
    }
    return Number(trimmed);
  }

  return Number.NaN;
}

function normalizeRoutineSet(input: RoutineSetType) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const linkValue = typeof input.link === "string" ? input.link.trim() : "";
  const rawKg = input.kg;

  return {
    title,
    set: toNumber(input.set),
    kg:
      rawKg === "" || rawKg === undefined || rawKg === null
        ? 0
        : toNumber(rawKg),
    link: linkValue.length > 0 ? linkValue : undefined,
  };
}

export function normalizeRoutineRequestInput(input: RoutineRequestType) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const categoryId = toNumber(input.categoryId);

  const routine = Array.isArray(input.routine)
    ? input.routine.map((item) =>
        normalizeRoutineSet((item ?? {}) as RoutineSetType)
      )
    : [];

  return { title, categoryId, routine };
}

export function validateRoutineRequestInput(input: RoutineRequestType) {
  const normalized = normalizeRoutineRequestInput(input);
  const result = routineRequestSchema.safeParse(normalized);

  if (!result.success) {
    return {
      success: false as const,
      errors: result.errors,
      messages: result.errors[0].message,
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}
