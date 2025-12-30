import { useState, useEffect } from 'react';

export const useTheme = () => {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		return false;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDarkMode);
	}, [isDarkMode]);

	const toggleTheme = () => setIsDarkMode((prev) => !prev);

	return { isDarkMode, toggleTheme };
};
