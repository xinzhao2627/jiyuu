import { exec } from "child_process";
import { SiteAttribute, TimeListInterface } from "../../lib/jiyuuInterfaces";
import {
	browsersList,
	emulators,
	unsupported_browsers,
} from "../index-interface";
import * as util from "util";
import * as fs from "fs";
import { db, DB_WORKSPACE_FILE_PATH } from "../database/initializations";
import { app, BrowserWindow } from "electron";
import { join } from "path";
const execPromise = util.promisify(exec);

export async function blockUninstallIfNeeded(): Promise<void> {
	let hasRestriction = false;
	try {
		const r =
			(await db
				?.selectFrom("block_group")
				.select("restriction_type")
				.execute()) || [];
		for (const bg of r) {
			if (bg.restriction_type) {
				hasRestriction = true;
			}
		}
		const path = app.isPackaged
			? join(app.getPath("userData"), "hasRestriction.txt")
			: join(__dirname, DB_WORKSPACE_FILE_PATH + "/hasRestriction.txt");

		if (hasRestriction) {
			// if that txt already exists then do nothing, but if not, create the txt
			if (hasRestriction && !fs.existsSync(path)) {
				fs.writeFileSync(path, "true");
				console.log("lock txt file created");
			}
		} else {
			// clean now if there is no restriction
			if (fs.existsSync(path)) {
				fs.unlinkSync(path);
				console.log("no restriction, lock file deleted");
			}
		}
	} catch (error) {
		console.log("error checking blockuninstall: " + error);
	}

	return;
}

export function siteIncludes(
	siteData: SiteAttribute | TimeListInterface,
	target: string,
	isact: 0 | 1,
	is_absolute: undefined | boolean = true,
	whitelists: string[],
): boolean {
	const isFullUrlIncluded = "fullUrl" in siteData;

	// IF A KEYWORD IS ABSOLUTE YOU
	// MUST ONLY COMPARE EACH ATTRIBUTE OF A WEBPAGE,
	// NOT ITS PREFIX OR SUFFIX
	let res = false;
	if (
		whitelists.some((v) => siteData.url.includes(v)) ||
		(isFullUrlIncluded && whitelists.some((v) => siteData.fullUrl.includes(v)))
	) {
		res = false;
	} else if (!is_absolute) {
		res =
			Boolean(isact) &&
			(siteData.desc?.includes(target) ||
				siteData.keywords?.includes(target) ||
				siteData.title?.includes(target) ||
				siteData.url?.includes(target) ||
				(isFullUrlIncluded && siteData.fullUrl.includes(target)));
	} else {
		res =
			Boolean(isact) &&
			(siteData.desc === target ||
				siteData.keywords === target ||
				siteData.title === target ||
				siteData.url === target ||
				(isFullUrlIncluded && siteData.fullUrl === target));
	}
	return res;
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
export async function processFinder(lists: string): Promise<string> {
	let stdout = "";
	try {
		const res = await execPromise(`tasklist | findstr /I "${lists}"`);
		stdout = res.stdout;
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === 1
		) {
			stdout = "";
		} else {
			console.log("increment_active_browsers ERROR: ", error);
			return "";
		}
	}
	return stdout;
}
export async function processKiller(processName: string): Promise<void> {
	try {
		const { stderr } = await execPromise(`taskkill /F /IM ${processName}`);
		if (!stderr) {
			console.log("killed ", processName);
		}
	} catch (error) {
		console.error(`ERROR KILLING ${processName}, CAUSE: ${error}`);
	}
}
export async function taskKiller_win(b: browsersList): Promise<void> {
	try {
		const name = b.name;
		const processName = name.endsWith(".exe") ? name : `${name}.exe`;
		await processKiller(processName);
		// await fkill(name);
		b.elapsedMissing = 0;
	} catch (error) {
		console.log(error instanceof Error ? error.message : error);
	}
}

export async function increment_active_browsers(
	browserLists: browsersList[],
	mainWindow: BrowserWindow | undefined | null,
): Promise<void> {
	let stdout = "";
	// console.log("CALLING FROM INCREMENT");

	// get the list of all current active browsers
	stdout = await processFinder(
		browserLists.map((v) => v.process + ".exe").join(" "),
	);

	stdout = stdout.trim().toLowerCase();

	const toWarnBrowsers: { process: string; url: string }[] = [];

	const oneThirdTime =
		((
			await db
				?.selectFrom("user_options")
				.select("secondsUntilClosed")
				.executeTakeFirst()
		)?.secondsUntilClosed || 1) / 3;

	for (const b of browserLists) {
		const processName = b.process;
		if (stdout.includes(processName)) {
			b.elapsedMissing += 1;

			// this is for ui:
			// if the app still cant detect the extension from the active brower,
			// send the warning to the ui if it exceeds one third of the delay
			if (b.elapsedMissing >= oneThirdTime) {
				toWarnBrowsers.push({ process: b.name, url: b.url });
			}
		}
	}

	// send warning through a response channel
	try {
		if (toWarnBrowsers.length > 0) {
			if (mainWindow) {
				mainWindow.webContents.send("extensionwarning/response", {
					data: toWarnBrowsers,
				});
			}
		}
	} catch (error) {
		console.log("INCREMENT ERROR: " + error);

		mainWindow?.webContents.send("extensionwarning/response", {
			error: error,
		});
	}

	return;
}
export function findBrowser(ua_string: string): string {
	let name = "";
	if (ua_string.includes("firefox")) name = "firefox";
	else if (ua_string.includes("brave")) name = "brave";
	else if (ua_string.includes("edg/") || ua_string.includes("edge/"))
		name = "msedge";
	else if (ua_string.includes("opr/") || ua_string.includes("oprgx/"))
		name = "opera";
	else if (ua_string.includes("vivaldi/")) name = "vivaldi";
	else if (ua_string.includes("avast/")) name = "avast_secure";
	else if (ua_string.includes("torch/")) name = "torch";
	else if (ua_string.includes("comodo_dragon/")) name = "comodo_dragon";
	else if (ua_string.includes("yabrowser/")) name = "yandex";
	else if (ua_string.includes("chromium/")) name = "chromium";
	else if (ua_string.includes("chrome")) name = "chrome";

	// do for nightly? or other variants of other browsers?
	return name;
}
export async function killManager(): Promise<void> {
	const r = await db
		?.selectFrom("user_options")
		.select(["blockUnsupportedBrowser", "blockEmulators"])
		.executeTakeFirst();
	const targetedProcesses: string[] = [];
	const toBlockUnsupported = r?.blockUnsupportedBrowser;
	const toBlockEmulators = r?.blockEmulators;
	if (toBlockUnsupported) {
		targetedProcesses.push(
			...unsupported_browsers.map((v) => v.process + ".exe"),
		);
	}
	if (toBlockEmulators) {
		targetedProcesses.push(...emulators.map((v) => v + ".exe"));
	}
	// console.log("CALLING FROM kill manager");
	if (targetedProcesses.length > 0) {
		const res = await processFinder(targetedProcesses.join(" "));

		if (toBlockEmulators) {
			for (const e of emulators) {
				if (res.includes(e)) {
					await processKiller(e + ".exe");
				}
			}
		}
		if (toBlockUnsupported) {
			for (const b of unsupported_browsers) {
				if (res.includes(b.process)) {
					await processKiller(b.process + ".exe");
				}
			}
		}
	}

	return;
}

export function taskList_win(): string {
	let res = "";
	const psc = `
		$registryPaths = @(
			"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*",
			"HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*",
			"HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*"
		)

		foreach ($path in $registryPaths) {
			Get-ItemProperty $path |
			Where-Object { $_.DisplayName -and $_.UninstallString } |
			Select-Object @{Name="Name"; Expression={$_.DisplayName}}, @{Name="InstallPath"; Expression={$_.InstallLocation}}, @{Name="ExePath"; Expression={$_.DisplayIcon}}, @{Name="Uninstaller"; Expression={$_.UninstallString}}
		}
		$results | ConvertTo-Json -Depth 3  
	`;
	exec(`powershell -Command "${psc}"`, (err, stdout) => {
		if (err) {
			console.error("Error:", err);
			return;
		}
		try {
			const appList = JSON.parse(stdout);
			console.log("Apps with icons:", appList);
			res = JSON.stringify(appList);
		} catch (parseError) {
			console.error("Failed to parse PowerShell output:", parseError);
		}
	});
	return res;
}

export function isURL(str: string): boolean {
	const pattern =
		/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
	return pattern.test(str.trim());
}

export function cleanURL(str: string): string {
	return str
		.trim()
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
