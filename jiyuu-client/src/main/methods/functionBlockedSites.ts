import { db } from "../database/initializations";
import {
	block_group_WITH_blocked_content,
	blocked_content,
} from "../database/tableInterfaces";

export async function getBlockedContentDataOneGroup(
	_data: { id: number; group_name: string } | undefined,
): Promise<blocked_content[] | undefined> {
	const res = !(_data && _data.id)
		? await db
				?.selectFrom("blocked_content")
				.selectAll()
				.orderBy("target_text", "asc")
				.execute()
		: await db
				?.selectFrom("blocked_content")
				.where("block_group_id", "=", _data.id)
				.selectAll()
				.orderBy("target_text", "asc")
				.execute();
	return res;
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

		.execute();
	return res;
}
