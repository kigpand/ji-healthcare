import { z } from "zod";

export const RoutineDataSchema = z.object({
  kg: z.number(),
  set: z.number(),
  title: z.string(),
  link: z.string().optional(),
});

export const RoutineInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  date: z.string(),
  routine: z.array(RoutineDataSchema),
});

export const RoutineSchema = z.object({
  routines: z.array(RoutineInfoSchema),
});

export const RoutineRequestSchema = z.object({
  title: z.string(),
  category: z.string(),
  routine: z.array(RoutineDataSchema),
});
