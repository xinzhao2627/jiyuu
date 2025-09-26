import { SiteAttribute, TimeListInterface } from "./jiyuu-interfaces";

export interface isWebpage {
	sendType: "isWebpage";
	data: SiteAttribute;
	tabId: number;
}

export interface isTimelist {
	sendType: "isTimelist";
	data: { [k: string]: TimeListInterface };
}

export interface isIncognito {
	sendType: "isIncognito";
	isIncognitoMessage: boolean;
	isAllowedIncognitoAccess: boolean;
	userAgent: string;
}
