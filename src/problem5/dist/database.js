"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.JsonDatabase = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const defaultDatabase = {
    books: [],
};
class JsonDatabase {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async read() {
        await this.ensureFile();
        const content = await fs_1.promises.readFile(this.filePath, "utf8");
        return JSON.parse(content);
    }
    async write(data) {
        await fs_1.promises.mkdir(path_1.default.dirname(this.filePath), { recursive: true });
        await fs_1.promises.writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    }
    async ensureFile() {
        try {
            await fs_1.promises.access(this.filePath);
        }
        catch {
            await this.write(defaultDatabase);
        }
    }
}
exports.JsonDatabase = JsonDatabase;
const databasePath = process.env.DATABASE_FILE
    ? path_1.default.resolve(process.env.DATABASE_FILE)
    : path_1.default.resolve(__dirname, "../data/database.json");
exports.database = new JsonDatabase(databasePath);
