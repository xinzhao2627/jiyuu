import { db } from "../database/initializations";
import { whitelist } from "../database/tableInterfaces";
import { getBlockedContentDataAll } from "./functionBlockedSites";

export async function get_whitelist_all(): Promise<whitelist[]> {
	const rows = await db?.selectFrom("whitelist").selectAll().execute();
	return rows ?? [];
}

export async function whitelist_does_exist(item: string): Promise<boolean> {
	const r = await db
		?.selectFrom("whitelist")
		.selectAll()
		.where("item", "=", item)
		.executeTakeFirstOrThrow();
	return r ? true : false;
}

export async function whitelist_put(v: {
	item: string;
	whitelist_type: "app" | "url";
}): Promise<void> {
	await db
		?.insertInto("whitelist")
		.values({
			item: v.item,
			whitelist_type: v.whitelist_type,
		})
		.executeTakeFirstOrThrow();
}

export async function whitelist_is_in_blockgroup(
	item: string,
): Promise<{ is_included: boolean; included_blockgroups: string[] }> {
	const blocked_content = await getBlockedContentDataAll();
	let is_included = false;
	const included_blockgroups: Set<string> = new Set();
	if (!blocked_content)
		return { is_included, included_blockgroups: [...included_blockgroups] };

	// loop all blocked contents
	for (const b of blocked_content) {
		// check if its included in one of the blocked groups
		if (item.includes(b.target_text)) {
			included_blockgroups.add(b.group_name);
			is_included = true;
		}
	}
	return { is_included, included_blockgroups: [...included_blockgroups] };
}
