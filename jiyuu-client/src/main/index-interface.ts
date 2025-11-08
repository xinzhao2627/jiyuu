import { whitelist } from "./database/tableInterfaces";
export type whitelist_put_type = whitelist;

export type supported_browsers = {
	process_name: string;
	identifier: string[];
	finder_keywords: string[];
};

export type browsersList = {
	name: string;
	process: string;
	elapsedMissing: number;
};
