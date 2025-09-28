// THESE 3 are different types of inputs came from the extension
import { Generated, JSONColumnType, Selectable } from "kysely";

export interface SiteAttribute {
	desc: string;
	keywords: string;
	url: string;
	title: string;
	descDoc: string;
	keywordsDoc: string;
}
export interface TimeListInterface extends SiteAttribute {
	secondsElapsed: number;
	startTime: Date;
	tabId: number;
	dateObject: string;
	baseUrl: string;
	fullUrl: string;
}

////
// export interface BlockedSites {
// 	target_text: string;
// 	block_group_id: number;
// }

// export interface BlockedSites_with_configs extends BlockedSites {
// 	is_grayscaled: 0 | 1;
// 	is_blurred: 0 | 1;
// 	is_covered: 0 | 1;
// 	is_muted: 0 | 1;
// 	group_name: string;
// 	is_activated: 0 | 1;
// }

// export interface BlockGroup {
// 	id: number;
// 	group_name: string;
// 	is_grayscaled: 0 | 1;
// 	is_blurred: 0 | 1;
// 	is_covered: 0 | 1;
// 	is_muted: 0 | 1;
// 	is_activated: 0 | 1;
// 	restriction_type: string | null;
// 	auto_deactivate: 0 | 1;
// }

export type ConfigType =
	| "usageLimit"
	| "randomText"
	| "restrictTimer"
	| "password";
export interface ConfigCommonType {
	config_type: ConfigType;
}
export interface UsageLimitData_Config {
	usage_reset_value: number;
	usage_reset_type: "d" | "w" | "h";
	usage_time_left: number;
	usage_reset_value_mode: "minute" | "hour";
	config_type: "usageLimit";
	last_updated_date: string;
	pause_until: number;
}
export interface Password_Config {
	password: string;
	config_type: "password";
}
export interface RestrictTimer_Config {
	start_date: Date;
	end_date: Date;
	config_type: "restrictTimer";
}

export interface RandomText_Config {
	randomTextCount: number;
	config_type: "randomText";
}

export interface BlockGroupConfig {
	block_group_id: number;
	config_data:
		| UsageLimitData_Config
		| Password_Config
		| RestrictTimer_Config
		| RandomText_Config;
	config_type: ConfigType;
}
// export interface BlockGroupConfig {

// }
// for full block groups with ui indications
export interface BlockGroup_Full extends block_group {
	configs_json: string;
	usage_label: string;
	restriction_label: string;
}

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
}
export type block_group = Selectable<block_groupTable>;
export interface block_group_configTable {
	id: Generated<number>;
	block_group_id: number;
	config_type: ConfigType;
	config_data: JSONColumnType<
		| UsageLimitData_Config
		| Password_Config
		| RestrictTimer_Config
		| RandomText_Config
	>;
}
export type block_group_config = Selectable<block_group_configTable>;

export interface blocked_contentTable {
	target_text: string;
	block_group_id: number;
	is_absolute: 0 | 1;
}
export type blocked_content = Selectable<blocked_contentTable>;

export interface user_optionsTable {
	id: Generated<number>;
	secondsUntilClosed: number;
	blockUnsupportedBrowser: 0 | 1;
	blockTaskManager: 0 | 1;
	blockCalendar: 0 | 1;
}

export interface usage_logTable {
	id: Generated<number>;
	base_url: string | null;
	full_url: string | null;
	date_object: string;
	seconds_elapsed: number;
}

export interface migrationTable {
	id: string;
}

export interface DB {
	block_group: block_groupTable;
	blocked_content: blocked_contentTable;
	block_group_config: block_group_configTable;
	usage_log: usage_logTable;
	user_options: user_optionsTable;
	migration: migrationTable;
}

export interface block_group_WITH_blocked_content
	extends block_group,
		blocked_content {}

export interface Error_Info {
	error: string | undefined;
	info: string | undefined;
}

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const FIVE_MINUTES = ONE_MINUTE * 5;
export const TEN_MINUTES = FIVE_MINUTES * 2;
export const THIRTY_MINUTES = TEN_MINUTES * 3;
export const ONE_HOUR = THIRTY_MINUTES * 2;
export const SIX_HOURS = ONE_HOUR * 6;
export const ONE_DAY = SIX_HOURS * 4;
