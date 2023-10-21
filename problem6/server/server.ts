import app from "./app";
const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, async () => {
  console.log(`Run problem6 with port ${PORT}`);
});

process.on("SIGINT", () =>
  server.close(() => console.log("Exit Server Express"))
);
