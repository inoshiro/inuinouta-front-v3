export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

export class ApiException extends Error {
  public status: number;
  public details?: Record<string, any>;

  constructor(status: number, message: string, details?: Record<string, any>) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.details = details;
  }
}

/**
 * Django REST APIへのリクエストを送信する共通ユーティリティ
 */
export async function fetchDjangoApi<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, any>;
    query?: Record<string, any>;
  } = {}
): Promise<T> {
  const config = useRuntimeConfig();
  const { method = "GET", body, query } = options;

  // URLにクエリパラメータを追加
  const url = new URL(`${config.djangoApiUrl}${endpoint}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 配列の場合は複数のパラメータとして追加
        if (Array.isArray(value)) {
          value.forEach(item => {
            url.searchParams.append(key, String(item));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  try {
    const response = await $fetch<T>(url.toString(), {
      method,
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response as T;
  } catch (error: any) {
    console.error(`Django API Error (${endpoint}):`, error);

    // $fetchのエラーオブジェクトから情報を抽出
    const status = error.response?.status || error.statusCode || 500;
    const message =
      error.response?._data?.detail || error.message || "API Error";

    throw new ApiException(status, message, error.response?._data);
  }
}
