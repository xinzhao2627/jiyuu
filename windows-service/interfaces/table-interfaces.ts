import { Generated, Selectable } from "kysely";
import { ConfigType } from "./jiyuu-interfaces";

export interface block_groupTable {
	id: Generated<number>;
	group_name: string;
	is_grayscaled: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	is_activated: 0 | 1;
	is_blurred: 0 | 1;
	auto_deactivate: 0 | 1;
	restriction_type: ConfigType | null;
	date_created: string;
}
export type block_group = Selectable<block_groupTable>;
export interface block_group_configTable {
	id: Generated<number>;
	block_group_id: number;
	config_type: ConfigType;
	config_data: string;
}
export type block_group_config = Selectable<block_group_configTable>;

export interface blocked_contentTable {
	target_text: string;
	block_group_id: number;
	is_absolute: 0 | 1;
	is_whitelist: 0 | 1;
}
export type blocked_content = Selectable<blocked_contentTable>;

export interface user_optionsTable {
	id: Generated<number>;
	secondsUntilClosed: number;
	blockUnsupportedBrowser: 0 | 1;
	blockTaskManager: 0 | 1;
	blockCalendar: 0 | 1;
	dashboardDateMode: "m" | "w" | "d";
}

export interface usage_logTable {
	id: Generated<number>;
	base_url: string | null;
	full_url: string | null;
	date_object: string;
	seconds_elapsed: number;
}
export type usage_log = Selectable<usage_logTable>;

export interface block_group_usage_logTable {
	id: Generated<number>;
	block_group_id: number;
	date_object: string;
	seconds_elapsed: number;
}
export type block_group_usage_log = Selectable<block_group_usage_logTable>;

export interface click_countTable {
	id: Generated<number>;
	base_url: string;
	date_object: string;
}
export type click_count = Selectable<click_countTable>;

export interface migrationTable {
	id: string;
	db_update_desc: string;
	date: string;
}

export interface DB {
	block_group: block_groupTable;
	blocked_content: blocked_contentTable;
	block_group_config: block_group_configTable;
	block_group_usage_log: block_group_usage_logTable;
	usage_log: usage_logTable;
	user_options: user_optionsTable;
	migration: migrationTable;
	click_count: click_countTable;
}

export interface block_group_WITH_blocked_content
	extends block_group,
		blocked_content {}
