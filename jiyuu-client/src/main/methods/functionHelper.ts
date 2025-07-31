// import { exec } from "child_process";
import fkill from "fkill";
import { SiteAttribute, TimeListInterface } from "../../lib/jiyuuInterfaces";

export function siteIncludes(
	siteData: SiteAttribute | TimeListInterface,
	target: string,
	isact: 0 | 1,
): boolean {
	return (
		Boolean(isact) &&
		(siteData.desc?.includes(target) ||
			siteData.keywords?.includes(target) ||
			siteData.title?.includes(target) ||
			siteData.url?.includes(target))
	);
}

export function showError(
	err: unknown,
	event: Electron.IpcMainEvent,
	indication: string,
	channel: string,
): void {
	const errorMsg = err instanceof Error ? err.message : String(err);
	console.error(indication, errorMsg);
	event.reply(channel, {
		error: errorMsg,
	});
}

export function taskKiller_win(name: string): void {
	// exec(`taskkill /F /IM ${name}.exe`, (err) => {
	// 	if (err) {
	// 		console.error(`ERROR KILLING ${name}, CAUSE: ${err.message}`);
	// 	} else {
	// 		console.log(`${name} closed successfully`);
	// 	}
	// });
	try {
		fkill(name);
	} catch (error) {
		console.log(error instanceof Error ? error.message : error);
	}
}

// export function taskIncludes_win(name: string): boolean {
// 	let isIncluded = false;
// 	exec("tasklist", (err, stdout) => {
// 		if (err) {
// 			console.log("failed to load tasklist, cause: ", err.message);
// 			return;
// 		}
// 		if (stdout.includes(`${name}.exe`)) {
// 			isIncluded = true;
// 		}
// 	});
// 	return isIncluded;
// }
