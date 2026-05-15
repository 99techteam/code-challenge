const iconModules = import.meta.glob<{ default: string }>(
  '../../assets/tokens/*.{svg,png}',
  {
    eager: true,
    query: '?url',
  }
);

const iconMap: Record<string, string> = {};

for (const path in iconModules) {
  const match = path.match(/\/([^/]+)\.(svg|png)$/);
  if (match) {
    const filename = match[1];
    iconMap[filename.toUpperCase()] = iconModules[path].default;
  }
}

export const TokenIconMap = iconMap;

export const getTokenIcon = (currency: string): string | undefined => {
  return TokenIconMap[currency.toUpperCase()];
};
