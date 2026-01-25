import { API_URL } from "@/utils/config";

type ParseMode = "json" | "text" | "none";

type ApiClientOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  parse?: ParseMode;
};

export class ApiError<T = unknown> extends Error {
  status: number;
  data: T | string | null;

  constructor(message: string, status: number, data: T | string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { json, parse = "json", headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  const requestInit: RequestInit = {
    ...rest,
    headers,
  };

  if (json !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    requestInit.body = JSON.stringify(json);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, requestInit);
  } catch (error) {
    throw new ApiError(
      "네트워크에 연결하지 못했습니다. 인터넷 상태를 확인해주세요.",
      0,
      error instanceof Error ? error.message : null,
    );
  }

  if (!response.ok) {
    let errorBody: unknown = null;
    const contentType = response.headers.get("content-type");
    try {
      if (contentType?.includes("application/json")) {
        errorBody = await response.json();
      } else {
        errorBody = await response.text();
      }
    } catch {
      errorBody = null;
    }

    const message =
      typeof errorBody === "object" && errorBody && "message" in errorBody
        ? String((errorBody as any).message)
        : "요청을 처리하지 못했습니다.";

    throw new ApiError(message, response.status, errorBody);
  }

  if (parse === "none") {
    return undefined as T;
  }

  if (parse === "text") {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
