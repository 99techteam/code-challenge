const icons = import.meta.glob("/src/assets/tokens/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const iconMap = Object.fromEntries(
  Object.entries(icons).map(([path, url]) => {
    const fileName = path.split("/").pop()?.replace(".svg", "") ?? "";
    return [fileName.toLowerCase(), url];
  })
);

export const getTokenIconUrlSmart = (symbol?: string): string => {
  if (!symbol) return "";
  return iconMap[symbol.toLowerCase()] || "";
};
