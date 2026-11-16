export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export const useToast = () => {
  // Global reactive toasts list state
  const toasts = useState<ToastItem[]>("app-toasts", () => []);

  const add = (
    message: string,
    type: ToastItem["type"] = "info",
    duration = 4000,
  ) => {
    // Toasts should only be rendered client-side
    if (!import.meta.client) return;

    const id = Date.now() + Math.random();
    toasts.value.push({ id, message, type });

    // Auto-dismiss toast after specified duration
    setTimeout(() => {
      remove(id);
    }, duration);
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return {
    toasts,
    success: (msg: string, d?: number) => add(msg, "success", d),
    error: (msg: string, d?: number) => add(msg, "error", d),
    warning: (msg: string, d?: number) => add(msg, "warning", d),
    info: (msg: string, d?: number) => add(msg, "info", d),
    remove,
  };
};
