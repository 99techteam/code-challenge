import commonColor from "./commonColors";

const semanticColors = {
  // for the default background and foreground of the page
  default: {
    DEFAULT: commonColor.grey[5],
    foreground: {
      DEFAULT: commonColor.grey[100],
      icon: commonColor.grey[90],
    },
  },

  // brand colors
  brand: {
    DEFAULT: commonColor.pink[60],
    bold: "#095600",
    foreground: commonColor.white,
  },

  // primary variant colors maybe sa
  primary: {
    DEFAULT: commonColor.pink[60],
    disabled: "#DEFDDB",
    foreground: commonColor.white,
  },
  // for the secondary background and foreground content of the page
  secondary: {
    DEFAULT: commonColor.grey[10],
    foreground: commonColor.grey[60],
  },
  warning: {
    DEFAULT: commonColor.orange[40],
    foreground: commonColor.white,
  },
  danger: {
    DEFAULT: commonColor.red[50],
    foreground: commonColor.white,
    hover: {
      foreground: commonColor.white,
    },
  },
  success: {
    DEFAULT: commonColor.green[40],
    foreground: commonColor.white,
  },
  info: {
    DEFAULT: "#1275B7",
    foreground: commonColor.white,
  },
  muted: {
    DEFAULT: commonColor.grey[10],
    foregroundLight: commonColor.grey[30],
    foreground: commonColor.grey[40],
  },
  overlay: {
    DEFAULT: "#2E2E2E99",
  },

  // for the base background and foreground of content like cards, modals, etc.
  // the level is based on the elevation of the content and how it is darker or lighter
  content: {
    DEFAULT: commonColor.white,
    foreground: commonColor.grey[100],
    1: {
      DEFAULT: commonColor.grey[5],
      foreground: commonColor.grey[100],
    },
    2: {
      DEFAULT: commonColor.grey[10],
      foreground: commonColor.grey[100],
    },
  },
  divider: {
    DEFAULT: commonColor.grey[15],
    card: commonColor.grey[10],
  },
  border: {
    DEFAULT: "#E6E6E6",
    danger: commonColor.red[60],
  },
  placeholder: {
    DEFAULT: commonColor.grey[60],
  },
  table: {
    DEFAULT: commonColor.grey[10],
    header: "#F0F0F0",
    headerContent: commonColor.grey[70],
    rowContent: commonColor.grey[100],
    rowHover: "#efffee",
  },
};

export default semanticColors;
