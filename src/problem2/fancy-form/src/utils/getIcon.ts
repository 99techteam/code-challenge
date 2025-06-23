const modules = import.meta.glob("../assets/tokens/*.svg", { eager: true });

export const icons: Record<string, string> = {};

Object.entries(modules).forEach(([path, mod]) => {
	const match = path.match(/\/([\w-]+)\.svg$/);
	if (match) {
		icons[match[1]] = (mod as { default: string }).default;
	}
});
