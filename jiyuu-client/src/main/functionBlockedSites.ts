import { Statement } from "better-sqlite3";
import { db } from ".";

export function getBlockedSitesDataOneGroup(
	_data,
): Statement<unknown[], unknown> | undefined {
	return db?.prepare(
		_data.id
			? `SELECT bs.target_text, bs.block_group_id 
				FROM blocked_sites AS bs 
				JOIN block_group as bg ON 
					bs.block_group_id = bg.id 
				WHERE 
					bs.block_group_id = ${_data.id}`
			: "SELECT * FROM blocked_sites",
	);
}

export function getBlockedSitesDataAll():
	| Statement<unknown[], unknown>
	| undefined {
	return db?.prepare(
		`SELECT 
				bs.target_text, bg.is_grayscaled, 
				bg.is_covered, bg.is_muted, 
				bg.group_name, bg.is_activated,
				bs.block_group_id
			FROM blocked_sites as bs 
			INNER JOIN block_group as bg ON 
				bg.id = bs.block_group_id`,
	);
}
