import type { AxiosError } from "axios";

export type IMutation = {
  onSuccess?: VoidFunction;
  onError?: (error: AxiosError<{ message: string }>) => void;
  onSettled?: VoidFunction;
  onMutate?: VoidFunction;
};
