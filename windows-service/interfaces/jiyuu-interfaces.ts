import { block_group } from "./table-interfaces";

// THESE 3 are different types of inputs came from the extension
export interface SiteAttribute {
	desc: string;
	keywords: string;
	url: string;
	title: string;
}
export interface TimeListInterface extends SiteAttribute {
	secondsElapsed: number;
	startTime: Date;
	tabId: number;
	dateObject: string;
	baseUrl: string;
	fullUrl: string;
}

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

	// this num indicates the date.getTime() or the pause deadline
	pause_until: number;
}
export interface Password_Config {
	password: string;
	config_type: "password";
}
export interface RestrictTimer_Config {
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

// for full block groups with ui indications
export interface BlockGroup_Full extends block_group {
	configs_json: string;
	usage_label: string;
	restriction_label: string;
}
