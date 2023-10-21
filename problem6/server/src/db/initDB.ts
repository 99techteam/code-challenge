import mongoose from "mongoose";
import { env } from "process";

class Database {
  static INSTANCE: any;
  MONGO_URI: string = env.MONGO_URI || "";
  constructor() {
    this.connect();
  }

  private connect(typeDb: string = "MongoDb") {
    mongoose
      .connect(this.MONGO_URI)
      .then(() => console.log(`Connect ${typeDb} Successfully`))
      .catch((err) => console.log(err));
  }

  static getInstance() {
    if (!this.INSTANCE) this.INSTANCE = new Database();
    return this.INSTANCE;
  }
}

export default Database.getInstance();
