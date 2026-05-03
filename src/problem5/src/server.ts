import { app } from "./app";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Problem 5 server is running on http://localhost:${port}`);
});

