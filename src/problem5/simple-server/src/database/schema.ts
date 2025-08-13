import type { ColumnType, Generated, Kysely } from "kysely";

export type Resource = {
	id: Generated<number>;
	name: string;
	description: string;
	createdAt: ColumnType<Date, never, never>;
	updatedAt: ColumnType<Date, never, string | Date>;
	deletedAt: ColumnType<Date, never, string | Date | null>;
};

export type Database = {
	resource: Resource;
};

export type KyselyInstance = Kysely<Database>;
