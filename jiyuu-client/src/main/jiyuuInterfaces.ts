// THESE 3 are different types of inputs came from the extension
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
export interface BlockedSites {
	target_text: string;
	block_group_id: number;
}

export interface BlockedSites_with_configs extends BlockedSites {
	is_grayscaled: 0 | 1;
	is_blurred: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	group_name: string;
	is_activated: 0 | 1;
}

export interface BlockGroup {
	id: number;
	group_name: string;
	is_grayscaled: 0 | 1;
	is_blurred: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	is_activated: 0 | 1;
	is_restricted: 0 | 1;
	auto_deactivate: 0 | 1;
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
	usage_reset_value_mode: string;
	config_type: "usageLimit";
	last_updated_date: string;
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

// export interface BlockGroupConfig {

// }
