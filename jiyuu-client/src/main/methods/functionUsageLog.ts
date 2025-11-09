import { isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { db } from "../database/initializations";

export async function getDashboardSummarized(
	mode: "m" | "w" | "d",
): Promise<Map<string, number>> {
	const isSame =
		mode === "d" ? isSameDay : mode === "m" ? isSameMonth : isSameWeek;
	const res = await db?.selectFrom("usage_log").selectAll().execute();

	const summarized = new Map<string, number>();
	const newDate = new Date();
	if (res) {
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			if (isSame(new Date(r.date_object), newDate)) {
				if (r.base_url) {
					summarized.set(
						r.base_url,
						(summarized.get(r.base_url) || 0) + r.seconds_elapsed,
					);
				} else {
					summarized.set(
						"other_urls",
						(summarized.get("other_urls") || 0) + r.seconds_elapsed,
					);
				}
			}
		}
	}

	return summarized;
}

export async function getClicksSummarized(
	mode: "m" | "w" | "d",
): Promise<Map<string, number>> {
	const isSame =
		mode === "d" ? isSameDay : mode === "m" ? isSameMonth : isSameWeek;
	// get all clicks of the same day/month/week depending on users choice
	const clicks = await db
		?.selectFrom("click_count")
		.select(["base_url", "date_object"])
		.execute();
	const clicksSummarized = new Map<string, number>();
	const newDate = new Date();
	if (clicks) {
		for (let i = 0; i < clicks.length; i++) {
			const c = clicks[i];
			if (isSame(new Date(c.date_object), newDate) && c.base_url) {
				clicksSummarized.set(
					c.base_url,
					(clicksSummarized.get(c.base_url) || 0) + 1,
				);
			}
		}
	}
	return clicksSummarized;
}
export async function getBlockGroupTimeUsage(
	mode: "m" | "w" | "d",
): Promise<Map<number, { name: string; secondsElapsed: number }> | null> {
	const blockGroups = await db
		?.selectFrom("block_group")
		.select(["id", "group_name", "date_created"])
		.execute();

	if (!blockGroups) return null;
	// group_id / seconds_elapsed
	const blockGroupWithTime = new Map<
		number,
		{ name: string; secondsElapsed: number }
	>();

	const rows = await db
		?.selectFrom("block_group_usage_log")
		.selectAll()
		.execute();

	if (!rows) return null;

	const isSame =
		mode === "d" ? isSameDay : mode === "m" ? isSameMonth : isSameWeek;
	const newDate = new Date();
	for (const r of rows) {
		const logDate = new Date(r.date_object);
		if (isSame(logDate, newDate) && r.block_group_id && r.seconds_elapsed) {
			const val = blockGroupWithTime.get(r.block_group_id)?.secondsElapsed;
			const bg = blockGroups.find((v) => v.id === r.block_group_id);
			if (bg && bg.id) {
				blockGroupWithTime.set(r.block_group_id, {
					name: bg.group_name,
					secondsElapsed: val ? val + r.seconds_elapsed : r.seconds_elapsed,
				});
			}
		}
	}

	return blockGroupWithTime;
}

export async function clearUsageLogIfNeeded(): Promise<void> {
	const install = await db
		?.selectFrom("meta_info")
		.select("value")
		.where("key", "=", "usage_log_date")
		.executeTakeFirst();

	if (!install) return;

	const installDate = new Date(install.value);
	const now = new Date();
	const monthsPassed =
		(now.getFullYear() - installDate.getFullYear()) * 12 +
		(now.getMonth() - installDate.getMonth());
	// console.log("PASSED: " + monthsPassed);
	// monthsPassed >= 3
	if (monthsPassed >= 3) {
		console.log("3 months passed — clearing usage_log...");
		await db?.deleteFrom("usage_log").execute();
		await db?.deleteFrom("block_group_usage_log").execute();
		// update install date so it resets the 3-month cycle
		await db
			?.updateTable("meta_info")
			.set({ value: new Date().toISOString() })
			.where("key", "=", "usage_log_date")
			.execute();
	}
}
