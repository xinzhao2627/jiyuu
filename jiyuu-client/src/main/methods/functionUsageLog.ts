import { isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { db } from "../database/initializations";
import { getDashboardDateMode } from "./functionUserOptions";

export default async function getDashboardSummarized(): Promise<{
	usageLogSummarized: Map<string, number> | null;
	clicksSummarized: Map<string, number> | null;
}> {
	const mode = await getDashboardDateMode();

	const res = await db?.selectFrom("usage_log").selectAll().execute();
	if (!res) return { usageLogSummarized: null, clicksSummarized: null };
	const isSame =
		mode === "d" ? isSameDay : mode === "m" ? isSameMonth : isSameWeek;
	const summarized = new Map<string, number>();
	const newDate = new Date();
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
	// get all clicks of the same day/month/week depending on users choice
	const clicks = await db
		?.selectFrom("click_count")
		.select(["base_url", "date_object"])
		.execute();
	const clicksSummarized = new Map<string, number>();
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

	return { usageLogSummarized: summarized, clicksSummarized: clicksSummarized };
}
