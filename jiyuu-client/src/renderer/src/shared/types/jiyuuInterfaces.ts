// THESE 3 are different types of inputs came from the extension
export interface SiteAttribute {
	desc: string;
	keywords: string;
	url: string;
	title: string;
	descDoc: string;
	keywordsDoc: string;
}
export interface SiteTime extends SiteAttribute {
	secondsElapsed: number;
	startTime: Date;
	lastLogTime: Date;
}

export interface SiteTime_with_tabId extends SiteTime {
	tabId: number;
}
////
export interface BlockedSites {
	target_text: string;
	block_group_id: number;
}

export interface BlockedSites_with_configs extends BlockedSites {
	is_grayscaled: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	group_name: string;
	is_activated: 0 | 1;
}

export interface BlockGroup {
	id: number;
	group_name: string;
	is_grayscaled: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	is_activated: 0 | 1;
}
