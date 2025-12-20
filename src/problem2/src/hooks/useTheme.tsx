import { useState, useEffect } from 'react';

export const useTheme = () => {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		return false;
	});

	// Lắng nghe thay đổi theme hệ thống
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleChange = (e: MediaQueryListEvent) => {
			setIsDarkMode(e.matches);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	// Đồng bộ class 'dark' vào <html> để Tailwind nhận diện
	useEffect(() => {
		const root = window.document.documentElement;
		if (isDarkMode) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [isDarkMode]);

	// Hàm toggle thủ công
	const toggleTheme = () => {
		setIsDarkMode((prev) => !prev);
	};

	// TRẢ VỀ CẢ TOGGLETHEME
	return { isDarkMode, toggleTheme };
};
