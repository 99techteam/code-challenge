import path from "path";

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  dataDir: path.resolve(__dirname, "../../data"),
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};

export default config;

