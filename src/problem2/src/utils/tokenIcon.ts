export const getTokenIconUrl = (currency: string): string => {
  return `${import.meta.env.VITE_TOKEN_ICON_BASE_URL}${currency}.svg`;
};

