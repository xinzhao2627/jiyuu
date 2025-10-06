import Database from "better-sqlite3";
import { Kysely, sql, SqliteDialect } from "kysely";
import { DB } from "./tableInterfaces";
import { app } from "electron";
import { join } from "path";
import * as fs from "fs";

export let db: Kysely<DB> | undefined;
function logDbError(error: unknown, context: string): void {
	const logPath = join(app.getPath("userData"), "db_errors.log");
	const msg = `[${new Date().toISOString()}] [${context}] ${String(error)}`;

	fs.appendFileSync(logPath, msg, { encoding: "utf-8" });
}
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

const migrations: Array<{ id: string; up: () => Promise<void>; desc: string }> =
	[
		{
			id: "test",
			up: async () => {
				console.log("hi");
			},
			desc: "",
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
					.addColumn("is_covered", "integer", (col) =>
						col.notNull().defaultTo(0),
					)
					.addColumn("is_muted", "integer", (col) => col.notNull().defaultTo(0))
					.addColumn("is_blurred", "integer", (col) =>
						col.notNull().defaultTo(0),
					)
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
			desc: "",
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
					.execute();
				console.log("init-blocked_content");
			},
			desc: "",
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
			desc: "",
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
			desc: "",
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
					.addColumn("dashboardDateMode", "text", (col) =>
						col.notNull().defaultTo("d"),
					)
					.execute();
				console.log("init-user_options");
			},
			desc: "",
		},
		{
			id: "init-click_count",
			up: async () => {
				await db?.schema
					.createTable("click_count")
					.ifNotExists()
					.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
					.addColumn("base_url", "text", (col) => col.notNull())
					.addColumn("date_object", "text", (col) => col.notNull())
					.execute();
			},
			desc: "",
		},
		{
			id: "insert-user_options",
			up: async () => {
				await db
					?.insertInto("user_options")
					.values({
						secondsUntilClosed: 60,
						blockUnsupportedBrowser: 0,
						blockTaskManager: 0,
						blockCalendar: 0,
						dashboardDateMode: "d",
					})
					.executeTakeFirst();
			},
			desc: "",
		},
		{
			id: "alter-addColumn-block_group-date_created",
			up: async () => {
				try {
					await db?.schema
						.alterTable("block_group")
						.addColumn("date_created", "text", (col) =>
							col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
						)
						.execute();
				} catch (error) {
					logDbError(error, "alter-addColumn-block_group-date_created");
				}
			},
			desc: "",
		},
		{
			id: "init-block_group_usage_log",
			up: async () => {
				await db?.schema
					.createTable("block_group_usage_log")
					.ifNotExists()
					.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
					.addColumn("block_group_id", "integer", (col) =>
						col.notNull().references("block_group.id"),
					)
					.addColumn("date_object", "text", (col) => col.notNull())
					.addColumn("seconds_elapsed", "integer", (col) => col.notNull())
					.execute();
			},
			desc: "",
		},
		{
			id: "init-whitelist",
			up: async () => {
				await db?.schema
					.createTable("whitelist")
					.ifNotExists()
					.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
					.addColumn("whitelist_type", "text", (col) => col.notNull())
					.addColumn("item", "text", (col) => col.notNull())
					.execute();
			},
			desc: "",
		},
		{
			id: "init-meta_info",
			up: async () => {
				await db?.schema
					.createTable("meta_info")
					.ifNotExists()
					.addColumn("key", "text", (col) => col.primaryKey())
					.addColumn("value", "text")
					.execute();
			},
			desc: "",
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
			console.log("new migration: ", m.id);

			await m.up();
			await db
				?.insertInto("migration")
				.values({
					id: m.id,
					db_update_desc: m.desc,
					date: new Date().toISOString(),
				})
				.execute();
		}
	}
}

export async function startAppDb(): Promise<void> {
	await db?.schema
		.createTable("migration")
		.ifNotExists()
		.addColumn("id", "text", (col) => col.notNull())
		.addColumn("db_update_desc", "text")
		.addColumn("date", "text", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();
	await migrate();

	try {
		const tables = await db?.introspection.getTables();
		console.log(
			"Available tables:",
			tables?.map((t) => t.name),
		);

		// if the installation date is not initialized, initialize it
		const info = await db?.selectFrom("meta_info").selectAll().execute();
		if (info) {
			// if theres no install date in the meta info, add one
			if (!info.find((v) => v.key === "install_date")) {
				await add_install_date();
			}
			if (!info.find((v) => v.key === "usage_log_date")) {
				await add_usage_log_date();
			}
			if (!info.find((v) => v.key === "vacuum_date")) {
				await add_vacuum_date();
			}
		} else {
			await add_install_date();
			await add_usage_log_date();
			await add_vacuum_date();
		}
		await db?.executeQuery(sql`VACUUM`.compile(db));
	} catch (error) {
		console.log("migration error! : ", error);
	}
}

async function add_usage_log_date(): Promise<void> {
	await db
		?.insertInto("meta_info")
		.values({ key: "usage_log_date", value: new Date().toISOString() })
		.executeTakeFirstOrThrow();
}

async function add_vacuum_date(): Promise<void> {
	await db
		?.insertInto("meta_info")
		.values({ key: "vacuum_date", value: new Date().toISOString() })
		.executeTakeFirstOrThrow();
}

async function add_install_date(): Promise<void> {
	await db
		?.insertInto("meta_info")
		.values({ key: "install_date", value: new Date().toISOString() })
		.executeTakeFirstOrThrow();
}
