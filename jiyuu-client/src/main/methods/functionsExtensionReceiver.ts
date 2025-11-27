import { mainWindow } from "../index";
import { getBlockedContentDataAll } from "./functionBlockedSites";
import { getBlockGroup_with_config } from "./functionConfig";
import { siteIncludes } from "./functionHelper";
import {
	SiteAttribute,
	TimeListInterface,
	UsageLimitData_Config,
} from "../../lib/jiyuuInterfaces";
import { db } from "../database/initializations";
import { get_whitelist_all } from "./whitelist_helpers";

// timelist interface also includes keywords, desc, headers, etc.
export async function validateTimelist(
	siteData: Map<string, TimeListInterface>,
): Promise<void> {
	// the site data here is multiple,
	// meaning there could be more than 1 tabs that are sent
	try {
		// then log the sites in siteData to the usage table
		await logToUsageLog(siteData);

		// then get all listed sites/keyword in jiyuu
		const rows = (await getBlockedContentDataAll()) || [];
		const whitelists = (await get_whitelist_all()).map((v) => v.item);
		// loops all listed sites/keywords and determine their <group_id, seconds>
		const blockGroupsList = new Map<number, number>();
		for (const r of rows) {
			const target = r.target_text;

			for (const v of siteData.values()) {
				// if one of the tab is included in the active block...
				if (siteIncludes(v, target, 1, Boolean(r.is_absolute), whitelists)) {
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

		// here you must log the consumed time of the block group that is detected
		const bgul: {
			block_group_id: number;
			date_object: string;
			seconds_elapsed: number;
		}[] = [];
		for (const [k, v] of blockGroupsList) {
			const n = await db
				?.selectFrom("block_group")
				.select("group_name")
				.where("id", "=", k)
				.executeTakeFirst();
			if (n && n.group_name) {
				bgul.push({
					block_group_id: k,
					seconds_elapsed: v,
					date_object: new Date().toISOString(),
				});
			}
		}
		if (bgul.length > 0) {
			await db?.insertInto("block_group_usage_log").values(bgul).execute();
		}

		// with the collected blockgroups list, update the time usage in config table
		// it would only update groups that has imposed usage limit
		await updateUsage(blockGroupsList);

		return;
	} catch (error) {
		const errorMsg = error instanceof Error ? error : String(error);
		console.error("Validate timelist error: ", errorMsg);
	}
}

// validates 1 site/webpage
export async function validateWebpage(data: {
	data: TimeListInterface | SiteAttribute;
	tabId: number;
}): Promise<string> {
	try {
		const siteData = data.data;
		const tabId: number = data.tabId;

		// get all blocked sites and their corresponding effects (grayscale, cover, mute)
		const rows = (await getBlockedContentDataAll()) || [];
		const whitelists = (await get_whitelist_all()).map((v) => v.item);

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
			if (
				siteIncludes(
					siteData,
					target,
					isact,
					Boolean(r.is_absolute),
					whitelists,
				)
			) {
				grayscale_count += r.is_grayscaled;
				muted_count += r.is_muted;
				covered_count += r.is_covered;
				blurred_count += r.is_blurred;
				following_detected_texts.push(r.target_text);
			}
		}
		const is_blocked =
			covered_count + muted_count + grayscale_count + blurred_count > 0;

		// update the ui
		const blockgroup_rows = await getBlockGroup_with_config();
		mainWindow.webContents.send("blockgroup/get/response", {
			data: blockgroup_rows,
		});
		return JSON.stringify({
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
		});
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error("Unable to block sites, cause: ", errorMsg);
	}
	return "";
}

export async function updateClickCount(data: SiteAttribute): Promise<void> {
	const match = data.url.match(/^(?:https?:\/\/)?(?:www\.)?([^/:?#]+)/);
	const base = match ? match[1] : "";
	if (!base) return;

	await db
		?.insertInto("click_count")
		.values({
			base_url: base,
			date_object: new Date().toISOString(),
		})
		.executeTakeFirst();
}

async function logToUsageLog(
	siteData: Map<string, TimeListInterface>,
): Promise<void> {
	const toInsert: {
		base_url: string;
		full_url: string;
		date_object: string;
		seconds_elapsed: number;
	}[] = [];

	// EXPERIMENTAL
	for (const sd of siteData.values()) {
		// console.log(sd);

		toInsert.push({
			base_url: sd.baseUrl,
			full_url: sd.fullUrl,
			date_object: sd.dateObject,
			seconds_elapsed: sd.secondsElapsed,
		});
	}
	// console.log("to insert: ", toInsert);

	if (toInsert.length > 0) {
		await db?.insertInto("usage_log").values(toInsert).execute();
	}
}

async function updateUsage(
	blockGroupsList: Map<number, number>,
): Promise<void> {
	// console.log("updating...");
	for (const [k, v] of blockGroupsList) {
		const configRow = await db
			?.selectFrom("block_group_config")
			.select(["config_type", "config_data", "block_group_id"])
			.where("block_group_id", "=", k)
			.where("config_type", "=", "usageLimit")
			.executeTakeFirst();

		if (!configRow) continue;

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
		if (newConfig.usage_time_left <= 0 && usageLimitData.pause_until <= 0) {
			await db
				?.updateTable("block_group")
				.set({ is_activated: 1 })
				.where("id", "=", k)
				.executeTakeFirst();
		}
		await db
			?.updateTable("block_group_config")
			.set({ config_data: JSON.stringify(newConfig) })
			.where("block_group_id", "=", k)
			.where("config_type", "=", "usageLimit")
			.executeTakeFirst();
	}
}
