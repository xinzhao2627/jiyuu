import { db, mainWindow } from ".";
import { getBlockedSitesDataAll } from "./functionBlockedSites";
import { getBlockGroup_with_config } from "./functionConfig";
import { siteIncludes } from "./functionHelper";
import {
	BlockedSites_with_configs,
	ConfigType,
	SiteAttribute,
	TimeListInterface,
	UsageLimitData_Config,
} from "../lib/jiyuuInterfaces";

export function validateTimelist(data, ws): void {
	// the site data here is multiple,
	// meaning there could be more than 1 tabs that are sent

	try {
		// console.log(data);
		const siteData = new Map<string, TimeListInterface>(
			Object.entries(data.data),
		);
		// remove tabs with 0 secons consumption
		function removeNoConsumptions(): void {
			const keylist = siteData.keys();
			for (const sd of keylist) {
				if (!siteData.get(sd)?.secondsElapsed) {
					siteData.delete(sd);
				}
			}
		}
		removeNoConsumptions();

		// TODO: then log the sites in siteData to the usage table (done)
		function logToUsageLog(): void {
			const insert = db?.prepare(`
				INSERT INTO usage_log(base_url, full_url, date_object, seconds_elapsed)
				VALUES (@base_url, @full_url, @date_object, @seconds_elapsed)
			`);
			// sitesdatas
			const insertMany = db?.transaction((sds: Array<TimeListInterface>) => {
				for (const sd of sds) {
					if (sd.baseUrl && sd.fullUrl) {
						// console.log("sdd: ", sd);

						const res = {
							base_url: sd.baseUrl,
							full_url: sd.fullUrl,
							date_object: sd.dateObject,
							seconds_elapsed: sd.secondsElapsed,
						};
						insert?.run(res);
					}
				}
			});
			if (insertMany) {
				insertMany([...siteData.values()]);
			}
		}
		logToUsageLog();

		// then get all listed sites/keyword in jiyuu
		const rows =
			(getBlockedSitesDataAll()?.all() as Array<BlockedSites_with_configs>) ||
			[];

		// loops all listed sites/keywords and determine their <group_id, seconds>
		const blockGroupsList = new Map<number, number>();
		for (const r of rows) {
			const target = r.target_text;

			for (const v of siteData.values()) {
				// if one of the tab is included in the active block...
				if (siteIncludes(v, target, 1)) {
					const s = blockGroupsList.get(r.block_group_id);

					// get the corresponding blockgroup/s of the data
					// add the each elapsed seconds into corresponding blockgroup
					// set the maximum secondsElapsed (if there area any duplicates)
					blockGroupsList.set(
						r.block_group_id,
						s ? Math.max(s, v.secondsElapsed) : v.secondsElapsed,
					);
				}
			}
		}
		// console.log("available block lists... ", blockGroupsList);

		// TODO:  with the collected blockgroups list, update the time usage in config table
		function updateUsage(): void {
			// console.log("updating...");
			for (const [k, v] of blockGroupsList) {
				const configRow = db
					?.prepare(
						"SELECT config_type, config_data, block_group_id FROM block_group_config WHERE block_group_id = ? AND config_type = 'usageLimit'",
					)
					.get(k) as {
					config_type: ConfigType;
					config_data: string;
					block_group_id: number;
				};
				if (!configRow) {
					continue;
				}
				const usageLimitData = JSON.parse(
					configRow.config_data,
				) as UsageLimitData_Config;

				// here just edit the timeleft, leave the other config data as it is
				const timeLeft = usageLimitData.usage_time_left - v;
				const newConfig: UsageLimitData_Config = {
					...usageLimitData,
					usage_time_left: timeLeft < 0 ? 0 : timeLeft,
				};

				// if this group has no time left, activate its block
				if (newConfig.usage_time_left <= 0) {
					db
						?.prepare("UPDATE block_group SET is_activated = 1 WHERE id = ?")
						.run(k);
				}
				db
					?.prepare(
						"UPDATE block_group_config SET config_data = ? WHERE block_group_id = ? AND config_type = 'usageLimit'",
					)
					.run(JSON.stringify(newConfig), k);
			}
		}
		updateUsage();
		// then validate if its blocked or not
		for (const v of siteData.values()) {
			validateWebpage({ data: v, tabId: v.tabId }, ws);
		}
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		console.error("Validate timelist error: ", errorMsg);
	}
}

// validates 1 site/webpage
export function validateWebpage(data, ws): void {
	try {
		const siteData: SiteAttribute | TimeListInterface = data.data;
		const tabId: number = data.tabId;

		// get all blocked sites and their corresponding effects (grayscale, cover, mute)
		const rows =
			(getBlockedSitesDataAll()?.all() as Array<BlockedSites_with_configs>) ||
			[];

		let grayscale_count = 0;
		let muted_count = 0;
		let covered_count = 0;
		let blurred_count = 0;
		// list of sites/keywords that are blocked
		const following_detected_texts: string[] = [];

		// check if the any of the sites attribute matched any of the keywords in blocked_sites
		for (const r of rows) {
			const isact = r.is_activated;
			const target = r.target_text;
			if (siteIncludes(siteData, target, isact)) {
				grayscale_count += r.is_grayscaled;
				muted_count += r.is_muted;
				covered_count += r.is_covered;
				blurred_count += r.is_blurred;
				following_detected_texts.push(r.target_text);
			}
		}
		const is_blocked = covered_count + muted_count + grayscale_count > 0;
		// console.log({
		// 	tabId: tabId,
		// 	isBlocked: is_blocked,
		// 	message: is_blocked
		// 		? "Blocking will proceed..."
		// 		: "Not blocking this webpage",
		// 	following_detected_texts: following_detected_texts,
		// 	blockParam: {
		// 		is_covered: covered_count > 0 ? 1 : 0,
		// 		is_muted: muted_count > 0 ? 1 : 0,
		// 		is_grayscaled: grayscale_count > 0 ? 1 : 0,
		// 	},
		// });
		// console.log("now sending msg to react...");
		const blockgroup_rows = getBlockGroup_with_config();
		mainWindow.webContents.send("blockgroup/get/response", {
			data: blockgroup_rows,
		});
		ws.send(
			JSON.stringify({
				tabId: tabId,
				isBlocked: is_blocked,
				message: is_blocked
					? "Blocking will proceed..."
					: "Not blocking this webpage",
				following_detected_texts: following_detected_texts,
				blockParam: {
					is_covered: covered_count > 0 ? 1 : 0,
					is_muted: muted_count > 0 ? 1 : 0,
					is_grayscaled: grayscale_count > 0 ? 1 : 0,
					is_blurred: blurred_count > 0 ? 1 : 0,
				},
			}),
		);
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error("Unable to block sites, cause: ", errorMsg);
	}
}
