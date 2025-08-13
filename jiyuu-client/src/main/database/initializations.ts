import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { DB } from "./tableInterfaces";
import { app } from "electron";
import { join } from "path";
export let db: Kysely<DB> | undefined;

export function initDb(): Kysely<DB> {
	const dbPath = app.isPackaged
		? join(app.getPath("userData"), "jiyuuData.db")
		: join(__dirname, "../../src/main/database/jiyuuData.db");
	console.log(dbPath);

	db = new Kysely<DB>({
		dialect: new SqliteDialect({
			database: new Database(dbPath),
		}),
	});
	return db;
}

const migrations: Array<{ id: string; up: () => Promise<void> }> = [
	{
		id: "test",
		up: async () => {
			console.log("hi");
		},
	},
	{
		id: "init-block_group",
		up: async () => {
			await db?.schema
				.createTable("block_group")
				.ifNotExists()
				.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
				.addColumn("group_name", "text", (col) => col.notNull())
				.addColumn("is_grayscaled", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.addColumn("is_covered", "integer", (col) => col.notNull().defaultTo(0))
				.addColumn("is_muted", "integer", (col) => col.notNull().defaultTo(0))
				.addColumn("is_blurred", "integer", (col) => col.notNull().defaultTo(0))
				.addColumn("is_activated", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.addColumn("auto_deactivate", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.addColumn("restriction_type", "text", (col) => col.defaultTo(null))
				.execute();
			console.log("init-block_group");
		},
	},
	{
		id: "init-blocked_content",
		up: async () => {
			await db?.schema
				.createTable("blocked_content")
				.ifNotExists()
				.addColumn("target_text", "text", (col) => col.notNull())
				.addColumn("block_group_id", "integer", (col) =>
					col.notNull().references("block_group.id"),
				)
				.addColumn("is_absolute", "integer", (col) => col.notNull())
				.addColumn("is_whitelist", "integer", (col) => col.notNull())
				.execute();
			console.log("init-blocked_content");
		},
	},
	{
		id: "init-block_group_config",
		up: async () => {
			await db?.schema
				.createTable("block_group_config")
				.ifNotExists()
				.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
				.addColumn("block_group_id", "integer", (col) =>
					col.notNull().references("block_group.id"),
				)
				.addColumn("config_type", "text")
				.addColumn("config_data", "text")
				.addUniqueConstraint("block_group_config_unique", [
					"block_group_id",
					"config_type",
				])
				.execute();
			console.log("init-block_group_config");
		},
	},
	{
		id: "init-usage_log",
		up: async () => {
			await db?.schema
				.createTable("usage_log")
				.ifNotExists()
				.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
				.addColumn("base_url", "text", (col) => col.notNull())
				.addColumn("full_url", "text", (col) => col.notNull())
				.addColumn("date_object", "text", (col) => col.notNull())
				.addColumn("seconds_elapsed", "integer")
				.execute();
			console.log("init-usage_log");
		},
	},
	{
		id: "init-user_options",
		up: async () => {
			await db?.schema
				.createTable("user_options")
				.ifNotExists()
				.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
				.addColumn("secondsUntilClosed", "integer")
				.addColumn("blockUnsupportedBrowser", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.addColumn("blockTaskManager", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.addColumn("blockCalendar", "integer", (col) =>
					col.notNull().defaultTo(0),
				)
				.execute();
			console.log("init-user_options");
		},
	},
];
export const testLog = (): void => console.log(migrations);

export async function migrate(): Promise<void> {
	const rows = await db
		?.selectFrom("migration")
		.selectAll()
		.execute()
		.catch(() => {});

	// get all the migrations that have already been applied
	const applied = rows ? new Set(rows.map((r) => r.id)) : new Set<string>();

	// run a pending migration and embed the id to the database
	for (const m of migrations) {
		if (!applied.has(m.id)) {
			await m.up();
			await db?.insertInto("migration").values({ id: m.id }).execute();
		}
	}
}

export async function startAppDb(): Promise<void> {
	await db?.schema
		.createTable("migration")
		.ifNotExists()
		.addColumn("id", "text", (col) => col.notNull())
		.execute();
	await migrate();

	try {
		const tables = await db?.introspection.getTables();
		console.log(
			"Available tables:",
			tables?.map((t) => t.name),
		);
	} catch (error) {
		console.log("migration error! : ", error);
	}
}
