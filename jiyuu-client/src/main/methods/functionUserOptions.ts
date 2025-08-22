import { db } from "../database/initializations";

export async function getDashboardDateMode(): Promise<"m" | "d" | "w"> {
	const res = await db
		?.selectFrom("user_options")
		.select("dashboardDateMode")
		.executeTakeFirst();
	if (!res) return "d";
	return res.dashboardDateMode;
}
