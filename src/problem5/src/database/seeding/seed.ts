import AppDataSource from "..";
import userSeeding from "./userSeeding";

async function seed() {
  await userSeeding(AppDataSource);
}

export default seed;