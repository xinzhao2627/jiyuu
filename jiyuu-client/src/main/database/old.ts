// import { db } from "../main";
// export function initBlockedSitesData(): void {
// 	db?.prepare(
// 		`CREATE TABLE IF NOT EXISTS blocked_sites(
//                 target_text text NOT NULL,
//                 block_group_id INTEGER NOT NULL REFERENCES block_group(id),
//                 PRIMARY KEY (target_text, block_group_id),
//                 FOREIGN KEY (block_group_id) REFERENCES block_group(id)
//             );`,
// 	).run();
// }
// export function initBlockGroup(): void {
// 	db?.prepare(
// 		`CREATE TABLE IF NOT EXISTS block_group(
//                 id INTEGER PRIMARY KEY,
//                 group_name VARCHAR(255) NOT NULL,
//                 is_grayscaled INTEGER DEFAULT 0,
//                 is_covered INTEGER DEFAULT 0,
//                 is_muted Integer DEFAULT 0,
//                 is_activated Integer DEFAULT 0,
// 				is_blurred INTEGER DEFAULT 0,
//                 auto_deactivate INTEGER DEFAULT 0,
//                 restriction_type VARCHAR(255) DEFAULT NULL
//             )`,
// 	).run();
// }
// export function initBlockGroupConfig(): void {
// 	db?.prepare(
// 		`CREATE TABLE IF NOT EXISTS block_group_config (
//             id INTEGER PRIMARY KEY,
//             block_group_id INTEGER NOT NULL REFERENCES block_group(id),
//             config_type VARCHAR(255),
//             config_data JSON,
// 			UNIQUE(block_group_id, config_type),
//             FOREIGN KEY (block_group_id) REFERENCES block_group(id)
//         )`,
// 	).run();
// }
// export function initUsageLog(): void {
// 	db?.prepare(
// 		`CREATE TABLE IF NOT EXISTS usage_log (
//                 id INTEGER PRIMARY KEY,
//                 base_url TEXT NOT NULL,
//                 full_url TEXT NOT NULL,
//                 date_object VARCHAR(255) NOT NULL,
//                 seconds_elapsed INTEGER
//             )`,
// 	).run();
// }
// // initialize time for today when the app opens, and also initialize it every minute
// export function initToday(): void {
// 	db?.prepare(
// 		`CREATE TABLE IF NOT EXISTS date_today (
//                 id INTEGER PRIMARY KEY,
//                 date_object VARCHAR(255) NOT NULL
//             )`,
// 	).run();
// 	function insertTodayIfNotExists(): void {
// 		const d = new Date();
// 		const row = db?.prepare(`SELECT * FROM date_today`).get() as {
// 			id: number;
// 			date_object: string;
// 		};
// 		if (!row) {
// 			console.log("no date, adding date today...");
// 			db?.prepare(`INSERT INTO date_today(date_object) VALUES(?)`).run(
// 				d.toISOString(),
// 			);
// 		}
// 	}
// 	insertTodayIfNotExists();
// 	// updates the date today every 1 minute
// 	let lastTime = new Date();
// 	function recursiveTimeChecker(): void {
// 		const one_minute = 60 * 1000;
// 		const currentTime = new Date();
// 		if (currentTime.getTime() - lastTime.getTime() < one_minute) {
// 			setTimeout(recursiveTimeChecker, 1000);
// 			return;
// 		}
// 		// console.log("renewing date..");
// 		db?.prepare("UPDATE date_today set date_object = ?").run(
// 			currentTime.toISOString(),
// 		);
// 		lastTime = currentTime;
// 		setTimeout(recursiveTimeChecker, one_minute);
// 	}
// 	recursiveTimeChecker();
// }
