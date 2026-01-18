import "reflect-metadata";
import { DataSource } from "typeorm";
import { ResourceOrmEntity } from "./resource/resource.orm-entity";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  entities: [ResourceOrmEntity],
});
