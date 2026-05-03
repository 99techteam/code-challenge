"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = Number(process.env.PORT ?? 3000);
app_1.app.listen(port, () => {
    console.log(`Problem 5 server is running on http://localhost:${port}`);
});
