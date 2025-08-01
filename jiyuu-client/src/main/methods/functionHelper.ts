import { exec } from "child_process";
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

export function blockTaskManager_win(): void {
	try {
		fkill("Taskmgr", { force: true });
	} catch (error) {
		console.error(
			"Failed to kill Task Manager:",
			error instanceof Error ? error.message : error,
		);
	}
}

export function blockActivityMonitor_mac(): void {
	try {
		fkill("Activity Monitor", { force: true });
	} catch (error) {
		console.error(
			"Failed to kill Task Manager:",
			error instanceof Error ? error.message : error,
		);
	}
}
