import { endOfDay, endOfMonth, endOfWeek, isSameDay, isSameMonth, isSameWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
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


export async function getDashboardOptimized(
	mode: "m" | "w" | "d",
): Promise<Map<string, number>> {
	  const now = new Date();

	const query = db?.selectFrom("usage_log")
		.select([
			"base_url",
			db.fn.sum("seconds_elapsed").as("total_seconds")
		])
		.where((eb) => {
			if (mode === "d") {
			return eb("date_object", ">=", startOfDay(now).toISOString())
						.and("date_object", "<", endOfDay(now).toISOString());
			}
			if (mode === "w") {
			return eb("date_object", ">=", startOfWeek(now).toISOString())
						.and("date_object", "<", endOfWeek(now).toISOString());
			}
			return eb("date_object", ">=", startOfMonth(now).toISOString())
					.and("date_object", "<", endOfMonth(now).toISOString());
		})
		.groupBy("base_url");

  	const res = await query?.execute();

  	const summarized = new Map<string, number>();
	if (res){
		for (const r of res) {
			summarized.set(r.base_url ?? "other_urls", Number(r.total_seconds));
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
export async function getClicksOptimized(
	mode: "m" | "w" | "d",
): Promise<Map<string, number>> {
	const now = new Date();

	const { start, end } = getDateRange(mode, now);

	const rows = await db?.selectFrom("click_count")
		.select([
			"base_url",
			(eb) => eb.fn.count("base_url").as("total")
		])
		.where("date_object", ">=", start.toISOString())
		.where("date_object", "<", end.toISOString())
		.groupBy("base_url")
		.execute();

	const map = new Map<string, number>();
	if (rows){
		for (const r of rows) {
			if (r.base_url) {
				map.set(r.base_url, Number(r.total));
			}
		}
	}


	return map;
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
export async function getBlockGroupTimeUsageOptimized(
  mode: "m" | "w" | "d",
): Promise<Map<number, { name: string; secondsElapsed: number }>> {

	const now = new Date();
	const { start, end } = getDateRange(mode, now);

	const rows = await db?.selectFrom("block_group_usage_log as log")
	.innerJoin("block_group as bg", "bg.id", "log.block_group_id")
	.select([
		"bg.id",
		"bg.group_name",
		(eb) => eb.fn.sum("log.seconds_elapsed").as("total_seconds")
	])
	.where("log.date_object", ">=", start.toISOString())
	.where("log.date_object", "<", end.toISOString())
	.groupBy(["bg.id", "bg.group_name"])
	.execute();

	const map = new Map<number,{ name: string; secondsElapsed: number }>();
	if (rows){
		for (const r of rows) {
			map.set(r.id, {
			name: r.group_name,
			secondsElapsed: Number(r.total_seconds),
			});
		}
	}


  return map;
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
		await db?.deleteFrom("click_count").execute();
		// update install date so it resets the 3-month cycle
		await db
			?.updateTable("meta_info")
			.set({ value: new Date().toISOString() })
			.where("key", "=", "usage_log_date")
			.execute();
	}
}
function getDateRange(mode: "m" | "w" | "d", now: Date) {
	if (mode === "d") {
		return { start: startOfDay(now), end: endOfDay(now) };
	}
	if (mode === "w") {
		return { start: startOfWeek(now), end: endOfWeek(now) };
	}
	return { start: startOfMonth(now), end: endOfMonth(now) };
}