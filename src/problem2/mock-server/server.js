const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.resolve(__dirname, "./db.json"));
const middlewares = jsonServer.defaults();

const port = 5005;
server.use(middlewares);

server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running at http://localhost:${port}`);
});
