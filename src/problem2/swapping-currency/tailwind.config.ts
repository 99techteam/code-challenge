import type { Config } from "tailwindcss/types/config";
import commonColor from "./src/themes/commonColors";
import semanticColors from "./src/themes/sematicColors";
import FONT_SIZE from "./src/themes/fontSize";

const tailwindConfig: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ...commonColor,
        ...semanticColors,
      },
      fontSize: FONT_SIZE,
    },
  },
};
export default tailwindConfig;
