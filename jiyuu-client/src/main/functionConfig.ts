import { db } from ".";
import {
	BlockGroup_Full,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "./jiyuuInterfaces";

export function getBlockGroup_with_config(): BlockGroup_Full[] | [] {
	const q = `
        SELECT bg.*, GROUP_CONCAT(
            CASE WHEN bgc.id IS NOT NULL
            THEN json_object(
                    'id', bgc.id,
                    'config_type', bgc.config_type,
                    'config_data', bgc.config_data
            ) END
        ) AS configs_json 
        FROM block_group bg 
        LEFT JOIN block_group_config bgc 
        ON bg.id = bgc.block_group_id
        GROUP BY  bg.id`;
	const rows = (db?.prepare(q).all() as BlockGroup_Full[]) || [];
	for (const r of rows) {
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
					r.usage_label = label;
				} else if (ct === "restrictTimer") {
					const rtl = `Locked until ${cd.end_date.toLocaleString()}`;
					r.restriction_label = rtl;
				}
			}
		}
	}
	return rows;
}

// ? `${Math.floor(utl / 60)} min left`
