import type { ICategory } from "@/interface/category";
import type { IRecord } from "@/interface/record";
import type { IRoutineInfo, IRoutineRequest } from "@/interface/routine";

export const WORKOUT_GOALS = ["근육 증가", "체중 감량", "체력 유지"] as const;
export const WORKOUT_ENVIRONMENTS = ["헬스장", "홈트", "야외"] as const;

export const COACH_REQUEST_LIMITS = {
  equipmentLength: 300,
  records: 100,
  routines: 100,
  categories: 100,
} as const;

export type WorkoutProfile = {
  goal: (typeof WORKOUT_GOALS)[number];
  environment: (typeof WORKOUT_ENVIRONMENTS)[number];
  minutes: number;
  equipment: string;
};

export type CoachRequest = {
  profile: WorkoutProfile;
  period: { start: string; end: string; timeZone: string };
  records: (Omit<IRecord, "routineId"> & { routineId: number | null })[];
  routines: IRoutineInfo[];
  categories: ICategory[];
  summary: { workoutCount: number; workoutDays: number };
  limitations: string[];
};

export type CoachRecommendation =
  | { kind: "existing"; routine: IRoutineInfo; reason: string }
  | { kind: "new"; draft: Omit<IRoutineRequest, "categoryId">; reason: string }
  | { kind: "rest"; reason: string };

export type CoachApiRecommendation =
  | { kind: "existing"; routineId: number; reason: string }
  | { kind: "new"; draft: Omit<IRoutineRequest, "categoryId">; reason: string }
  | { kind: "rest"; reason: string };

export type CoachResult = {
  source: "openai";
  request: CoachRequest;
  recommendation: CoachRecommendation;
};
