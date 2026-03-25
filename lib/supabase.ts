import { createClient } from "@supabase/supabase-js";

function getRequiredSupabaseUrl() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요."
    );
  }

  return value;
}

function getRequiredSupabaseAnonKey() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요."
    );
  }

  return value;
}

export const supabase = createClient(
  getRequiredSupabaseUrl(),
  getRequiredSupabaseAnonKey()
);
