import { DataSource } from "typeorm";
import { db } from "../config";
import path from "path"

const baseDir = path.join(__dirname);

const AppDataSource = new DataSource({
  type: 'mysql',
  host: db.host,
  port: parseInt(db.port),
  username: db.user,
  password: db.password,
  database: db.name,
  logging: true,
  synchronize: false, // Turn off this option because it will automaticly run migration when init connection
  entities: [baseDir + '/entities/*.{ts,js}'],
  migrations: [baseDir + '/migrations/*.{ts,js}'],
})

export default AppDataSource;