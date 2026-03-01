import {
  arraySchema,
  numberSchema,
  objectSchema,
  stringSchema,
} from "ji-type-schema";

export const RoutineDataSchema = objectSchema({
  kg: numberSchema(),
  set: numberSchema(),
  title: stringSchema(),
  link: stringSchema().optional(),
});

export const RoutineInfoSchema = objectSchema({
  id: numberSchema(),
  title: stringSchema(),
  category: stringSchema(),
  date: stringSchema(),
  routine: arraySchema(RoutineDataSchema),
});

export const RoutineSchema = objectSchema({
  routines: arraySchema(RoutineInfoSchema),
});

export const RoutineRequestSchema = objectSchema({
  title: stringSchema(),
  category: stringSchema(),
  routine: arraySchema(RoutineDataSchema),
});
