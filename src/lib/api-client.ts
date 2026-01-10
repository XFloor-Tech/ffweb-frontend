import axios, { type AxiosRequestConfig } from "axios";

type ApiResult<T> = [T, null] | [null, unknown];

const baseURL = import.meta.env.DEV
  ? "http://5.189.254.222:8080"
  : import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({ baseURL, timeout: 1000 * 60 });

const apiRequest = async <T>(
  config: AxiosRequestConfig,
): Promise<ApiResult<T>> => {
  try {
    const response = await apiClient.request<T>(config);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
};

export { apiRequest };
