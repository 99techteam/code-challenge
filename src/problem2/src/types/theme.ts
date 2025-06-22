export type IThemeMode = "light" | "dark";

export interface IThemeColors {
  background: string;
  card: string;
}

export interface ITheme {
  mode: IThemeMode;
  colors: IThemeColors;
}
