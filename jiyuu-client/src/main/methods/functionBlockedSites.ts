import { db } from "../database/initializations";
import {
	block_group_WITH_blocked_content,
	blocked_content,
} from "../database/tableInterfaces";

export async function getBlockedContentDataOneGroup(
	_data: { id: number; group_name: string } | undefined,
): Promise<blocked_content[] | undefined> {
	const res = !(_data && _data.id)
		? await db?.selectFrom("blocked_content").selectAll().execute()
		: await db
				?.selectFrom("blocked_content")
				.where("block_group_id", "=", _data.id)
				.selectAll()
				.execute();
	return res;
	// return db?.prepare(
	// 	_data.id
	// 		? `SELECT bs.target_text, bs.block_group_id
	// 			FROM blocked_sites AS bs
	// 			JOIN block_group as bg ON
	// 				bs.block_group_id = bg.id
	// 			WHERE
	// 				bs.block_group_id = ${_data.id}`
	// 		: "SELECT * FROM blocked_sites",
	// );
}

export async function getBlockedContentDataAll(): Promise<
	block_group_WITH_blocked_content[] | undefined
> {
	const res = await db
		?.selectFrom("blocked_content")
		.innerJoin(
			"block_group",
			"block_group.id",
			"blocked_content.block_group_id",
		)
		.selectAll("block_group")
		.selectAll("blocked_content")
		// .select([
		// 	"blocked_content.target_text",
		// 	"block_group.is_grayscaled",
		// 	"block_group.is_covered",
		// 	"block_group.is_muted",
		// 	"block_group.group_name",
		// 	"block_group.is_activated",
		// 	"blocked_content.block_group_id",
		// 	"block_group.is_blurred",
		// ])
		.execute();
	return res;
	// return db?.prepare(
	// 	`SELECT
	// 			bs.target_text, bg.is_grayscaled,
	// 			bg.is_covered, bg.is_muted,
	// 			bg.group_name, bg.is_activated,
	// 			bs.block_group_id, bg.is_blurred
	// 		FROM blocked_sites as bs
	// 		INNER JOIN block_group as bg ON
	// 			bg.id = bs.block_group_id`,
	// );
}
