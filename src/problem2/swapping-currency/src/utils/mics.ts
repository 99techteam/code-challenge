export const debounce = (func: CallableFunction, wait: number) => {
  let timeout;
  return function (...args: unknown[]) {
    const later = function () {
      timeout = null;
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
