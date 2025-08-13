import { isBefore, isSameDay, isSameHour, isSameWeek } from "date-fns";
import { db } from "../database/initializations";
import { block_group, block_group_config } from "../database/tableInterfaces";
import {
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "../../lib/jiyuuInterfaces";
// import { RawBuilder, sql } from "kysely";

export async function getBlockGroup(): Promise<block_group[] | undefined> {
	const rows = await db?.selectFrom("block_group").selectAll().execute();
	return rows;
}

export async function setBlockGroup(
	group: block_group,
	new_group_name: string | undefined = undefined,
): Promise<void> {
	if (!group) throw "Invalid data provided for renaming block group";

	// if rename config exists and wants to rename, then rename
	const name =
		new_group_name && group.group_name !== new_group_name
			? new_group_name
			: group.group_name;
	await db
		?.updateTable("block_group")
		.set({
			group_name: name,
			is_activated: group.is_activated,
			is_grayscaled: group.is_grayscaled,
			is_covered: group.is_covered,
			is_muted: group.is_muted,
			restriction_type: group.restriction_type,
			auto_deactivate: group.auto_deactivate,
			is_blurred: group.is_blurred,
		})
		.where("id", "=", group.id)
		.executeTakeFirst();

	// db?.up(
	// 	`UPDATE block_group
	// 			SET
	// 				group_name = ?,
	// 				is_activated = ?,
	// 				is_grayscaled = ?,
	// 				is_covered = ?,
	// 				is_muted = ?,
	// 				restriction_type = ?,
	// 				auto_deactivate = ?,
	// 				is_blurred = ?
	// 			WHERE id = ?`,
	// ).run(
	// 	name,
	// 	group.is_activated,
	// 	group.is_grayscaled,
	// 	group.is_covered,
	// 	group.is_muted,
	// 	group.restriction_type,
	// 	group.auto_deactivate,
	// 	group.is_blurred,
	// 	group.id,
	// );
}

export async function blockGroupDelete(id: number): Promise<void> {
	await db
		?.deleteFrom("blocked_content")
		.where("block_group_id", "=", id)
		.executeTakeFirst();

	await db
		?.deleteFrom("block_group_config")
		.where("block_group_id", "=", id)
		.executeTakeFirst();

	await db?.deleteFrom("block_group").where("id", "=", id).executeTakeFirst();

	// db?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?").run(id);
	// db?.prepare("DELETE FROM block_group_config WHERE block_group_id = ?").run(
	// 	id,
	// );
	// db?.prepare("DELETE FROM block_group WHERE id = ?").run(id);
}

// this function is being called every second by the interval in index.ts
export async function updateBlockGroup(): Promise<void> {
	let cr = await db
		?.selectFrom("block_group_config")
		.select("config_type")
		.where((eb) =>
			eb.or([
				eb("config_type", "=", "usageLimit"),
				eb("config_type", "=", "restrictTimer"),
			]),
		)
		.selectAll()
		.execute();
	if (!cr) return;

	// let cr = db
	// 	?.prepare(
	// 		"SELECT config_type, block_group_id, config_data FROM block_group_config WHERE config_type = 'usageLimit' OR config_type = 'restrictTimer'",
	// 	)
	// 	.all() as Array<{
	// 	config_type: "usageLimit" | "restrictTimer";
	// 	block_group_id: number;
	// 	config_data: string;
	// }>;
	async function groupAutoDeact(id: number): Promise<void> {
		// db?.prepare(
		// 	"UPDATE block_group SET is_activated = 0 WHERE id = ? AND auto_deactivate = 1",
		// ).run(id);

		await db
			?.updateTable("block_group")
			.set({ is_activated: 0 })
			.where("id", "=", id)
			.where("auto_deactivate", "=", 1)
			.executeTakeFirst();
	}
	// this function updates the usage_time_left
	const currentDate = new Date();
	const elRemove: block_group_config[] = [];
	for (const r of cr) {
		const cd = JSON.parse(r.config_data) as
			| UsageLimitData_Config
			| RestrictTimer_Config
			| Password_Config
			| RandomText_Config;
		if (cd.config_type === "usageLimit") {
			const candiDate = new Date(cd.last_updated_date);
			switch (cd.usage_reset_type) {
				// if there is a block that has a day reset,
				// check if the day is new then if it is, reset the timeleft.. do also for hour and week
				case "d": {
					// we also check month and year besides the they if a user didnt logged in for 1 month or 1 year
					if (!isSameDay(candiDate, currentDate)) {
						cd.last_updated_date = currentDate.toISOString();
						cd.usage_time_left = cd.usage_reset_value;
						await groupAutoDeact(r.block_group_id);
					}
					break;
				}
				case "h": {
					if (!isSameHour(candiDate, currentDate)) {
						cd.last_updated_date = currentDate.toISOString();
						cd.usage_time_left =
							cd.usage_reset_value *
							(cd.usage_reset_value_mode === "minute" ? 60 : 60 * 60);
						await groupAutoDeact(r.block_group_id);
					}
					break;
				}
				case "w": {
					if (!isSameWeek(candiDate, currentDate)) {
						cd.last_updated_date = currentDate.toISOString();
						cd.usage_time_left = cd.usage_reset_value;
						await groupAutoDeact(r.block_group_id);
					}
					break;
				}
				default: {
					console.log("error updating the reset value");
					break;
				}
			}
		}
		// else if ... do also for restricted timer
		else if (cd.config_type === "restrictTimer") {
			const oldDate = cd.end_date;
			// if the date has already passed or is due, remove it from the config and also set the restrictio nto null from the block group
			if (isBefore(oldDate, currentDate)) {
				elRemove.push(r);
				await db
					?.deleteFrom("block_group_config")
					.where("config_type", "=", cd.config_type)
					.where("block_group_id", "=", r.block_group_id)
					.executeTakeFirst();
				await db
					?.updateTable("block_group")
					.set({ restriction_type: null })
					.where("id", "=", r.block_group_id)
					.executeTakeFirst();
				// db?.prepare(
				// 	"DELETE FROM block_group_config WHERE config_type = ? AND block_group_id = ?",
				// ).run(cd.config_type, r.block_group_id);
				// db?.prepare(
				// 	"UPDATE block_group SET restriction_type = null WHERE id = ?",
				// ).run(r.block_group_id);
			}
		}
		r.config_data = JSON.stringify(cd);
	}

	// if there are configs that were already removed,
	// exclude them from the ones that needs to be updated
	if (elRemove.length > 0) {
		cr = cr.filter((r) => {
			// check if r is in elRemove
			const isInElRemove = elRemove.find(
				(e) =>
					e.block_group_id === r.block_group_id &&
					e.config_type === r.config_type,
			);
			// if its in elRemove, make it false to be excluded in the new cr, else keep it by setting it to true
			return isInElRemove ? false : true;
		});
	}

	// then update it back to config data
	for (const r of cr) {
		await db
			?.updateTable("block_group_config")
			.set({ config_data: r.config_data })
			.where("block_group_id", "=", r.block_group_id)
			.where("config_type", "=", r.config_type)
			.executeTakeFirst();
	}

	// const updater = db?.prepare(
	// 	"UPDATE block_group_config SET config_data = ? WHERE block_group_id = ? AND config_type = ? ",
	// );
	// const updateMany = db?.transaction(
	// 	(
	// 		values: {
	// 			config_type: "usageLimit" | "restrictTimer";
	// 			block_group_id: number;
	// 			config_data: string;
	// 		}[],
	// 	) => {
	// 		for (const v of values) {
	// 			updater?.run(v.config_data, v.block_group_id, v.config_type);
	// 		}
	// 	},
	// );

	// if (updateMany) updateMany(cr);
	// else throw "Error, the database is not initialized properly";
}
