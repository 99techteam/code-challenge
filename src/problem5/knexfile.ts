import config from "./src/config";

const connection = {
  host: config.dbMasterHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  port: config.dbPort,
};

const sslConnection = {
  ...connection,
  ssl: {
    rejectUnauthorized: true,
  },
};

const settings = {
  development: {
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: "./knex/seeds/development",
    },
    connection,
  },
  test: {
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: "./knex/seeds/test",
    },
    connection: sslConnection,
  },
  production: {
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: "./knex/seeds/production",
    },
    connection: sslConnection,
  },
};

const sharedConfig = {
  client: "pg",
  migrations: {
    schemaName: "public",
    tableName: "knex_migrations",
    extension: "ts",
    directory: "./knex/migrations",
  },
};

const onUpdateTrigger = (table: string) => `CREATE TRIGGER ${table}_updated_at
BEFORE UPDATE ON ${table}
FOR EACH ROW
EXECUTE PROCEDURE on_update_timestamp();`;

module.exports = {
  ...(settings[config.nodeEnv as keyof typeof settings] ||
    settings.development),
  ...sharedConfig,
  onUpdateTrigger,
};
