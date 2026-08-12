import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface AuthUser {
  id: string;
  name: string | null;
  role: "admin" | "user";
  tracking_code: string;
}

interface UserLoginData extends AuthTokens {
  user: AuthUser;
}

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasUserSession = (): boolean =>
  Boolean(getAccessToken() || getRefreshToken());


const saveAuthTokens = ({
  access_token,
  refresh_token,
}: Partial<AuthTokens>): void => {
  if (access_token) localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
};

const requireResponseData = <T>(response: ApiResponse<T>): T => {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message);
  }

  return response.data;
};

export const api = axios.create({
  baseURL: import.meta.env.BASE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export const API_ACTIVITY_EVENT = "admin-api-activity";
let activeApiRequests = 0;
const notifyApiActivity = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(API_ACTIVITY_EVENT, { detail: activeApiRequests }));
  }
};

api.interceptors.request.use((config) => {
  activeApiRequests += 1;
  notifyApiActivity();
  const accessToken = getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Missing refresh token");

  const baseUrl = import.meta.env.BASE_API_URL || "";
  const response = await axios.post<ApiResponse<AuthTokens>>(
    `${baseUrl}/api/refresh`,
    { refresh_token: refreshToken },
  );
  const tokens = requireResponseData(response.data);
  saveAuthTokens(tokens);
  return tokens.access_token;
};


api.interceptors.response.use(
  (response) => {
    activeApiRequests = Math.max(0, activeApiRequests - 1);
    notifyApiActivity();
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    activeApiRequests = Math.max(0, activeApiRequests - 1);
    notifyApiActivity();
    const request = error.config as RetryRequestConfig | undefined;
    const isAuthRequest =
      request?.url?.includes("/api/admin/login") ||
      request?.url?.includes("/api/login") ||
      request?.url?.includes("/api/refresh");

    if (!request || error.response?.status !== 401 || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshPromise ||= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const accessToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearAuthTokens();
      const loginPath = window.location.pathname.startsWith("/admin")
        ? "/admin/login"
        : "/login";
      if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath);
      }
      return Promise.reject(refreshError);
    }
  },
);

export const loginUser = async (trackingCode: string): Promise<AuthUser> => {
  const response = await api.post<ApiResponse<UserLoginData>>("/api/login", {
    tracking_code: trackingCode,
  });
  const loginData = requireResponseData(response.data);
  saveAuthTokens(loginData);
  return loginData.user;
};

export const loginAdmin = async (passcode: string): Promise<void> => {
  const response = await api.post<ApiResponse<AuthTokens>>("/api/admin/login", {
    passcode,
  });
  saveAuthTokens(requireResponseData(response.data));
};

export interface SessionUser {
  id: string;
  role: "admin" | "user";
  name?: string | null;
  tracking_code?: string | null;
}


export const getSessionUser = async (): Promise<SessionUser | null> => {
  if (!getAccessToken() && !getRefreshToken()) return null;

  try {
    const response = await api.get<ApiResponse<{ user: SessionUser }>>("/api/session");
    return response.data.data?.user || null;
  } catch {
    clearAuthTokens();
    return null;
  }
};

export const hasValidAdminSession = async (): Promise<boolean> => {
  const user = await getSessionUser();
  return user?.role === "admin";
};

export const hasValidUserSession = async (): Promise<boolean> => {
  const user = await getSessionUser();
  return user !== null;
};

