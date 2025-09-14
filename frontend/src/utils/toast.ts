// Minimal toast utility as a fallback when external libs are unavailable.
// Replace with your preferred UI toast library when ready.

type ToastFn = (message: string) => void;

const logWithIcon = (icon: string, message: string, logger: (msg?: any, ...optionalParams: any[]) => void) => {
  try {
    logger(`${icon} ${message}`);
  } catch {
    // no-op
  }
};

export const toast: { success: ToastFn; error: ToastFn; info: ToastFn } = {
  success: (message: string) => logWithIcon('✅', message, console.log),
  error: (message: string) => logWithIcon('❌', message, console.error),
  info: (message: string) => logWithIcon('ℹ️', message, console.info),
};

