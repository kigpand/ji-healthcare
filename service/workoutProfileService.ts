import type { WorkoutProfile } from "@/interface/coach";
import { getDatabase } from "@/lib/database";
import { validateWorkoutProfile } from "@/schema/workoutProfile.schema";

export async function getWorkoutProfile(): Promise<WorkoutProfile | null> {
  const db = await getDatabase();
  return db.getFirstAsync<WorkoutProfile>(
    "SELECT goal, environment, minutes, equipment FROM workout_profile WHERE id = 1"
  );
}

export async function saveWorkoutProfile(input: WorkoutProfile) {
  const profile = validateWorkoutProfile(input);
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO workout_profile (id, goal, environment, minutes, equipment)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET goal = excluded.goal,
       environment = excluded.environment, minutes = excluded.minutes,
       equipment = excluded.equipment`,
    profile.goal, profile.environment, profile.minutes, profile.equipment
  );
  return profile;
}
