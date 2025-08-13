import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database, KyselyInstance } from "./schema";
import "dotenv/config";
import type { Config } from "../config/config";

export class KyselyClient {
	public readonly db: KyselyInstance;
	private static instance: KyselyInstance;
	constructor(private readonly config: Config) {
		const dialect = new PostgresDialect({
			pool: new Pool({
				host: this.config.get("POSTGRES_HOST", "localhost"),
				port: +this.config.get("POSTGRES_PORT", "5432"),
				user: this.config.get("POSTGRES_USER"),
				password: this.config.get("POSTGRES_PASSWORD"),
				database: this.config.get("POSTGRES_DATABASE"),
				max: 10,
			}),
		});
		this.db = new Kysely<Database>({
			dialect,
			plugins: [new CamelCasePlugin()],
		});
	}

	public static getInstance(config: Config): KyselyInstance {
		const singleton = KyselyClient.instance;
		if (!singleton) {
			KyselyClient.instance = new KyselyClient(config).db;
		}
		return KyselyClient.instance;
	}
}
