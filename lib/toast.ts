import { toast } from "sonner";

export function showLoading(message: string, id = "app-action") {
  return toast.loading(message, { id });
}

export function showSuccess(message: string, id = "app-action") {
  return toast.success(message, { id, duration: 3500 });
}

export function showError(message: string, id = "app-action") {
  return toast.error(message, { id, duration: 5000 });
}

type ToastMessages = {
  loading: string;
  success: string;
  error: string;
};

type ShowPromiseOptions = {
  id?: string;
  mapError?: (error: unknown) => string;
};

export function showPromise<T>(
  promise: Promise<T>,
  messages: ToastMessages,
  options: ShowPromiseOptions = {}
): Promise<T> {
  const id = options.id ?? "app-action";
  toast.promise(promise, {
    id,
    loading: messages.loading,
    success: messages.success,
    error: (error) =>
      options.mapError?.(error) ?? messages.error,
  });
  return promise;
}
