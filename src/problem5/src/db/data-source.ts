import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { ResourceEntity } from "../entities/resource.entity";

export function createAppDataSource(databaseUrl = env.databaseUrl): DataSource {
  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [ResourceEntity],
    synchronize: true,
    logging: false
  });
}
