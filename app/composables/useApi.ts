// composables/useApi.ts
interface ApiOptions {
  showToast?: boolean;
  [key: string]: any;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const handleApiError = (error: any, showToast = true) => {
    if (!import.meta.client) return;

    const status = error?.response?.status || error?.statusCode || 500;
    const errorData = error?.response?._data || error?.data;

    const route = useRoute();
    const isAuthPage = route.path.startsWith("/auth");

    const toast = useToast();

    if (status === 401 && !isAuthPage) {
      if (showToast) {
        toast.error("Your session has expired. Please log in again.");
      }
      navigateTo("/auth/login");
      return;
    }

    if (!showToast) return;

    switch (status) {
      case 403:
        toast.warning("You do not have permission to access this section.");
        break;
      case 404:
        toast.warning("The requested information was not found (404).");
        break;
      case 422:
        toast.warning(
          errorData?.message || "The submitted information is invalid.",
        );
        break;
      case 429:
        toast.error(
          "The number of requests exceeds the limit. Please wait a moment.",
        );
        break;
      default:
        toast.error(
          errorData?.statusMessage ||
            errorData?.message ||
            "A server-side error has occurred. Please try again.",
        );
    }
  };

  const apiFetch = async <T = any>(
    url: string,
    options: ApiOptions = {},
  ): Promise<T> => {
    const { showToast = true, ...fetchOptions } = options;

    // Forward cookies automatically during Server-Side Rendering (SSR)
    const ssrHeaders = import.meta.server ? useRequestHeaders(["cookie"]) : {};

    try {
      return (await ($fetch as any)(url, {
        baseURL: (config.public.apiBase as string) || undefined,
        ...fetchOptions,
        headers: {
          ...ssrHeaders,
          ...(fetchOptions.headers || {}),
        },
      })) as T;
    } catch (err: any) {
      handleApiError(err, showToast);
      throw err;
    }
  };

  return { apiFetch };
};
