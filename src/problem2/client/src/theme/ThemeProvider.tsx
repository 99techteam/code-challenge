// Import required modules and selectors.
import { selectTheme } from './slice/selectors';

import * as React from 'react';
import { useSelector } from 'react-redux';

import { ThemeProvider as OriginalThemeProvider } from 'styled-components';

// Custom ThemeProvider component to manage theme context.
export const ThemeProvider = (props: { children: React.ReactNode }) => {
    // Retrieve the current theme from Redux store using useSelector.
    const theme = useSelector(selectTheme);

    // Wrap children components with OriginalThemeProvider and provide the theme.
    return (
        <OriginalThemeProvider theme={theme}>
            {React.Children.only(props.children)}
        </OriginalThemeProvider>
    );
};
