import { exec } from "child_process";
import fkill from "fkill";
import { SiteAttribute, TimeListInterface } from "../../lib/jiyuuInterfaces";
import { browsersList } from "../index-interface";
import * as util from "util";
import { db } from "../database/initializations";
const execPromise = util.promisify(exec);
export function siteIncludes(
	siteData: SiteAttribute | TimeListInterface,
	target: string,
	isact: 0 | 1,
	is_absolute: undefined | boolean = true,
	whitelists: string[],
): boolean {
	// IF A KEYWORD IS ABSOLUTE YOU
	// MUST ONLY COMPARE EACH ATTRIBUTE OF A WEBPAGE,
	// NOT ITS PREFIX OR SUFFIX
	let res = false;
	if (whitelists.some((v) => siteData.url.includes(v))) {
		res = false;
	} else if (!is_absolute) {
		res =
			Boolean(isact) &&
			(siteData.desc?.includes(target) ||
				siteData.keywords?.includes(target) ||
				siteData.title?.includes(target) ||
				siteData.url?.includes(target));
	} else {
		res =
			Boolean(isact) &&
			(siteData.desc === target ||
				siteData.keywords === target ||
				siteData.title === target ||
				siteData.url === target);
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

export async function taskKiller_win(b: browsersList): Promise<void> {
	try {
		const name = b.name;
		const processName = name.endsWith(".exe") ? name : `${name}.exe`;

		// await fkill(name);
		const { stderr } = await execPromise(`taskkill /F /IM ${processName}.exe`);

		if (stderr) {
			console.error(`ERROR KILLING ${processName}, CAUSE: ${stderr}`);
		}
		b.elapsedMissing = 0;
	} catch (error) {
		console.log(error instanceof Error ? error.message : error);
	}
}

export async function increment_active_browsers(
	browserLists: browsersList[],
): Promise<void> {
	const { stdout } = await execPromise(
		`tasklist | findstr /I "${browserLists.map((v) => v.process + ".exe").join(" ")}"`,
	);
	const res = stdout.trim().toLowerCase();

	for (const b of browserLists) {
		const processName = b.process;
		if (res.includes(processName)) {
			b.elapsedMissing += 1;
		}
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
	return name;
}

export async function killUnsupportedBrowsers(
	browserLists: browsersList[],
): Promise<void> {
	const toBlockUnsupported = (
		await db
			?.selectFrom("user_options")
			.select("blockUnsupportedBrowser")
			.executeTakeFirst()
	)?.blockUnsupportedBrowser;
	if (toBlockUnsupported) {
		if (browserLists) {
			console.log("hehe");
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

export async function blockTaskManager_win(): Promise<void> {
	try {
		await fkill("Taskmgr", { force: true });
	} catch (error) {
		console.error(
			"Failed to kill Task Manager:",
			error instanceof Error ? error.message : error,
		);
	}
}

export async function blockActivityMonitor_mac(): Promise<void> {
	try {
		await fkill("Activity Monitor", { force: true });
	} catch (error) {
		console.error(
			"Failed to kill Task Manager:",
			error instanceof Error ? error.message : error,
		);
	}
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
