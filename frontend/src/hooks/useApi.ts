import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

function extractData<T>(responseData: unknown): T {
  if (
    responseData !== null &&
    typeof responseData === 'object' &&
    'data' in (responseData as Record<string, unknown>)
  ) {
    return (responseData as Record<string, unknown>).data as T;
  }
  return responseData as T;
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<{ data: unknown }>
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await apiFn(...args);
        const payload = extractData<T>(res.data);
        setState({ data: payload, loading: false, error: null });
        return payload;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
        const msg =
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          axiosErr.message ||
          'Terjadi kesalahan';
        setState((prev) => ({ ...prev, loading: false, error: msg }));
        return null;
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function getApiErrorMessage(err: unknown): string {
  if (!err) return '';
  const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
  return (
    axiosErr.response?.data?.message ||
    axiosErr.response?.data?.error ||
    (err as Error).message ||
    'Terjadi kesalahan'
  );
}
