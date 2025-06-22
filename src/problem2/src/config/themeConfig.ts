import { ITheme, IThemeMode } from "../types/theme";

export const lightTheme: ITheme = {
  mode: "light",
  colors: {
    background: "#ffffff",
    card: "#0e0e2a",
  },
};

export const darkTheme: ITheme = {
  mode: "dark",
  colors: {
    background: "#0e0e2a",
    card: "#ffffff",
  },
};

export const getTheme = (mode: IThemeMode): ITheme => {
  return mode === "light" ? lightTheme : darkTheme;
};
