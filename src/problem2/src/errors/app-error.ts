export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export function getUserFacingMessage(error: unknown, fallback: string): string {
  return error instanceof AppError ? error.message : fallback;
}

let toastTimeout: number | undefined;

export function showToast(message: string, duration = 3200): void {
  const toast = document.querySelector<HTMLElement>('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), duration);
}
