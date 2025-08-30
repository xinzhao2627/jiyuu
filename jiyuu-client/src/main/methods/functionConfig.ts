import { sql } from "kysely";
import {
	BlockGroup_Full,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "../../lib/jiyuuInterfaces";
import { db } from "../database/initializations";

export async function getBlockGroup_with_config(): Promise<
	BlockGroup_Full[] | []
> {
	const res_rows: BlockGroup_Full[] = [];
	// const q = `
	//     SELECT bg.*, GROUP_CONCAT(
	//         CASE WHEN bgc.id IS NOT NULL
	//         THEN json_object(
	//                 'id', bgc.id,
	//                 'config_type', bgc.config_type,
	//                 'config_data', bgc.config_data
	//         ) END
	//     ) AS configs_json
	//     FROM block_group bg
	//     LEFT JOIN block_group_config bgc
	//     ON bg.id = bgc.block_group_id
	//     GROUP BY  bg.id`;
	const rows =
		(await db
			?.selectFrom("block_group as bg")
			.select([
				"bg.id",
				"bg.group_name",
				"bg.auto_deactivate",
				"bg.is_activated",
				"bg.is_blurred",
				"bg.is_covered",
				"bg.is_grayscaled",
				"bg.is_muted",
				"bg.restriction_type",
				"bg.date_created",
				sql<string>`
					GROUP_CONCAT(
					CASE 
						WHEN bgc.id IS NOT NULL THEN 
						json_object(
							'id', bgc.id,
							'config_type', bgc.config_type,
							'config_data', bgc.config_data
						)
					END
					)
				`.as("configs_json"),
			])
			.leftJoin("block_group_config as bgc", "bg.id", "bgc.block_group_id")
			.groupBy("bg.id")
			.execute()) || [];
	// console.log(rows);

	for (const r of rows) {
		let usage_label = "";
		let restriction_label = "";
		if (r.configs_json) {
			const cj = JSON.parse(`[${r.configs_json}]`) as {
				config_type: string;
				config_data: string;
			}[];

			for (const cjr of cj) {
				const cd = JSON.parse(cjr.config_data) as
					| UsageLimitData_Config
					| Password_Config
					| RestrictTimer_Config
					| RandomText_Config;
				const ct = cd.config_type;

				if (ct === "usageLimit") {
					const utl = cd.usage_time_left;
					const label =
						utl <= 0
							? "No time left, wait for reset"
							: utl > 60
								? `${(utl / 60).toFixed(1)} min left`
								: `${utl} sec left`;
					usage_label = label;
				} else if (ct === "restrictTimer") {
					const rtl = `Locked until ${cd.end_date.toLocaleString()}`;
					restriction_label = rtl;
				}
			}
		}
		res_rows.push({
			...r,
			usage_label: usage_label,
			restriction_label: restriction_label,
			date_created: r.date_created,
		});
	}
	return res_rows;
}

// ? `${Math.floor(utl / 60)} min left`
