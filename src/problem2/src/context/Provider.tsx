import React from "react";
import { ThemeProvider } from "./ThemeContext";

export const ContextProvider: React.FunctionComponent<{
  children: any;
}> = (props) => {
  const { children } = props;

  return <ThemeProvider>{children}</ThemeProvider>;
};
