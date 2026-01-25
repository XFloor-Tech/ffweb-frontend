import axios, {
  type AxiosRequestConfig,
  type AxiosResponseHeaders,
  type RawAxiosResponseHeaders,
} from "axios";

type AxiosHeaders = RawAxiosResponseHeaders | AxiosResponseHeaders;

type ApiResult<T> = [T, null, AxiosHeaders] | [null, unknown, null];

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({ baseURL, timeout: 1000 * 60 });

const apiRequest = async <T>(
  config: AxiosRequestConfig,
): Promise<ApiResult<T>> => {
  try {
    const response = await apiClient.request<T>(config);
    return [response.data, null, response.headers];
  } catch (error) {
    return [null, error, null];
  }
};

export { baseURL as API_BASE_URL, apiRequest };
