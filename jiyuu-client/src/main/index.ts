/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import {
	app,
	shell,
	BrowserWindow,
	ipcMain,
	Tray,
	Menu,
	nativeImage,
} from "electron";
import path, { join } from "path";
import url from "url";
// import { registerRoute } from "../lib/electron-router-dom";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import icon from "../../resources/JY.png?asset";
import { WebSocketServer } from "ws";
// import sqlite3 from "sqlite3";
import {
	blockUninstallIfNeeded,
	cleanURL,
	findBrowser,
	increment_active_browsers,
	isURL,
	killManager,
	showError,
	taskKiller_win,
} from "./methods/functionHelper";
import {
	updateClickCount,
	validateTimelist,
	validateWebpage,
} from "./methods/functionsExtensionReceiver";
import { db, initDb, startAppDb } from "./database/initializations";
import {
	blockGroupDelete,
	setBlockGroup,
	updateBlockGroup,
} from "./methods/functionsBlockGroup";
import { block_group, blocked_content } from "./database/tableInterfaces";
import {
	getBlockedContentDataAll,
	getBlockedContentDataOneGroup,
} from "./methods/functionBlockedSites";
import { getBlockGroup_with_config } from "./methods/functionConfig";
import {
	BlockGroup_Full,
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	TimeListInterface,
	UsageLimitData_Config,
} from "../lib/jiyuuInterfaces";
import { isPing, isTimelist, isWebpage } from "./webSocketInterface";
import { browsersList, whitelist_put_type } from "./index-interface";
import {
	clearUsageLogIfNeeded,
	getBlockGroupTimeUsage,
	getClicksSummarized,
	getDashboardSummarized,
} from "./methods/functionUsageLog";
import { getDashboardDateMode } from "./methods/functionUserOptions";
import {
	get_whitelist_all,
	whitelist_does_exist,
	whitelist_is_in_blockgroup,
	whitelist_put,
} from "./methods/whitelist_helpers";
import { exec } from "child_process";
import { getAutoUpdater } from "./updater";
import { UpdateInfo } from "electron-updater";
const isAutoStart = process.argv.includes("--auto-start");
const autoUpdater = getAutoUpdater();
export let mainWindow: BrowserWindow;
let tray: Tray | null = null;
let isQuitting: boolean = false;
function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 700,
		show: false,
		icon: icon,
		resizable: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
			nodeIntegration: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		if (!isAutoStart) {
			mainWindow.show();
		}
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});
	mainWindow.on("close", (event) => {
		if (!isQuitting) {
			event.preventDefault();
			if (process.platform === "darwin") {
				app.hide();
			} else {
				mainWindow.hide();
				if (process.platform === "win32" && tray) {
					// tray.displayBalloon({
					// 	iconType: "info",
					// 	title: "Jiyuu",
					// 	content: "The app is still running in the background",
					// });
				}
			}
		}
	});
	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, "../renderer/index.html"),
				protocol: "file",
				slashes: true,
			}),
		);
		// mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
	}
}

function createTray(): void {
	let trayIcon: Electron.NativeImage;
	if (process.platform === "win32") {
		trayIcon = nativeImage
			.createFromPath(icon)
			.resize({ width: 16, height: 16 });
	} else if (process.platform === "darwin") {
		trayIcon = nativeImage
			.createFromPath(icon)
			.resize({ width: 16, height: 16 });
		trayIcon.setTemplateImage(true);
	} else {
		trayIcon = nativeImage
			.createFromPath(icon)
			.resize({ width: 22, height: 22 });
	}

	tray = new Tray(icon);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show jiyuu",
			click: () => {
				if (process.platform === "darwin") {
					app.show();
				} else {
					mainWindow.show();
				}

				if (mainWindow.isMinimized()) {
					mainWindow.restore();
				}
				mainWindow.focus();
			},
		},
		{ type: "separator" },
		{
			label: "Quit/Exit app",
			click: () => {
				isQuitting = true;
				app.quit();
			},
		},
	]);

	tray.setToolTip("Jiyuu Website Blocker");
	tray.setContextMenu(contextMenu);

	if (process.platform === "darwin") {
		tray.on("click", () => {
			if (mainWindow.isVisible()) {
				app.hide();
			} else {
				app.show();
				mainWindow.focus();
			}
		});
	} else {
		tray.on("double-click", () => {
			if (mainWindow.isVisible()) {
				mainWindow.hide();
			} else {
				mainWindow.show();
				mainWindow.focus();
			}
		});
	}
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", () => {
		if (mainWindow) {
			// if (mainWindow.isMinimized()) mainWindow.restore();
			// if (!mainWindow.isVisible()) mainWindow.show();
			// mainWindow.focus();
		}
	});
	app.whenReady().then(async () => {
		// Set app user model id for windows
		createTray();
		electronApp.setAppUserModelId("com.jiyuu");

		autoUpdater.autoDownload = false;
		autoUpdater.autoInstallOnAppQuit = true;
		autoUpdater.checkForUpdatesAndNotify();

		// autoUpdater.on("checking-for-update", () => {
		// 	console.log("checking for updates...");
		// });
		// autoUpdater.on("update-not-available", (info) => {
		// 	console.log("Update not available:", info.version);
		// });

		// autoUpdater.on("error", (err) => {
		// 	console.error("Update error:", err);
		// });

		// autoUpdater.on("update-available", (info) => {
		// 	console.log("update available: " + info.version);
		// 	mainWindow.webContents.send("update-available", info);
		// });

		// Default open or close DevTools by F12 in development
		// and ignore CommandOrControl + R in production.
		// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
		app.on("browser-window-created", (_, window) => {
			optimizer.watchWindowShortcuts(window);
		});
		const JIYUU_URL = "jiyuu.app";
		let browsers_list: browsersList[] = [
			{
				name: "chrome",
				process: "chrome",
				elapsedMissing: 0,
				url: "https://chromewebstore.google.com/detail/jiyuu-web-blocker/imhjffmochmoadnclabphkcdjndmbjkf",
			},
			{
				name: "brave",
				process: "brave",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "msedge",
				process: "msedge",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "opera",
				process: "opera",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "opera_gx",
				process: "opera_gx",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "vivaldi",
				process: "vivaldi",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "avast_secure",
				process: "AvastBrowser",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "torch",
				process: "torch",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "comodo_dragon",
				process: "dragon",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "chromium",
				process: "chromium",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "yandex",
				process: "browser",
				elapsedMissing: 0,
				url: "google.com",
			},
			{
				name: "firefox",
				process: "firefox",
				elapsedMissing: 0,
				url: "https://addons.mozilla.org/en-US/firefox/addon/jiyuu-web-blocker/",
			},
		];
		// triggers when opening the app
		try {
			initDb();
			await startAppDb();
			console.log("initialization done");

			let lt = new Date();

			// use this to prevent race condition or database lock
			let isRunning = false;

			// refreshes the group every 1 second, also does the kill managers and uninstall prevention
			async function recursiveGroupChecker(): Promise<void> {
				if (isRunning) {
					setTimeout(recursiveGroupChecker, 100);
					return;
				}

				const ct = new Date();
				const timeElapsed = ct.getTime() - lt.getTime();
				if (timeElapsed < 1000) {
					setTimeout(recursiveGroupChecker, 100);
					return;
				}

				isRunning = true;
				lt = ct;
				try {
					await updateBlockGroup();
					await clearUsageLogIfNeeded();

					/**
					 * Whats happening here?
					 *
					 * first increment all elapsed time of all active browsers.
					 * This means it
					 * increments forever until it reaches n_seconds
					 * (regardless if the extension is installed or not)
					 * (it reverts back to 0 if it is both active
					 * and enabled in incognito
					 * (from the websocket code far below))
					 *
					 * Then if the elapsedMissing is filled up,
					 * kill the process of that active browser!
					 *
					 * However this only works if there is an active block group
					 */
					const active_blockGroups = await db
						?.selectFrom("block_group")
						.select("is_activated")
						.execute();
					await increment_active_browsers(browsers_list, mainWindow);

					if (
						active_blockGroups &&
						active_blockGroups.some((v) => v.is_activated)
					) {
						const maxTime =
							(
								await db
									?.selectFrom("user_options")
									.select("secondsUntilClosed")
									.executeTakeFirst()
							)?.secondsUntilClosed || 60;
						for (const b of browsers_list) {
							if (b.elapsedMissing >= maxTime) {
								console.log("klling ", b.name);
								await taskKiller_win(b);
							}
						}
					}

					// additionally use here the
					// killmanager to end process of unsupported browsers
					// and emulators (if enabled)
					await killManager();

					await blockUninstallIfNeeded();
				} catch (error) {
					console.error("Error in recursiveGroupChecker:", error);
				} finally {
					isRunning = false;
					setTimeout(recursiveGroupChecker, 1000);
				}
			}
			recursiveGroupChecker();
		} catch (e) {
			console.log(e);
		}
		// url opener when open extension is clicked in the ui
		ipcMain.on(
			"openurl",
			async (
				event: Electron.IpcMainEvent,
				_data: { url: string; process: string } | undefined,
			) => {
				try {
					if (!_data) throw "No data to process";
					if (!_data.process) throw "No process";

					if (_data.process === "default") {
						exec(`powershell Start-Process https://${JIYUU_URL}`);
						event.reply("openurl/response", {});
						return;
					}
					if (!_data.url) throw "No url to open";

					if (!browsers_list.some((v) => v.process === _data.process))
						throw "No browser to use";
					exec(`start ${_data.process} ${_data.url}`);
					event.reply("openurl/response", {});
				} catch (err) {
					showError(err, event, "Error opening url: ", "openurl/response");
				}
			},
		);
		ipcMain.on("check-for-update", async (event) => {
			try {
				const res = await autoUpdater.checkForUpdates();

				if (res?.isUpdateAvailable) {
					event.reply("check-for-update/response", { data: res });
				}
				event.reply("check-for-update/response", {});
			} catch (err) {
				showError(
					err,
					event,
					"Error getting checking for update: ",
					"check-for-update/response",
				);
			}
		});
		ipcMain.on("download-update", async (event) => {
			try {
				await autoUpdater.downloadUpdate();
				event.reply("download-update/response", {});
			} catch (err) {
				showError(
					err,
					event,
					"Error getting downloading update: ",
					"download-update/response",
				);
			}
		});
		ipcMain.on("install-update", async (event) => {
			try {
				isQuitting = true;
				autoUpdater.quitAndInstall();
			} catch (err) {
				isQuitting = false;
				showError(
					err,
					event,
					"Error getting installing update: ",
					"install-update/response",
				);
			}
		});
		ipcMain.on("update-available", async (event, _data: UpdateInfo | null) => {
			try {
				if (_data) {
					const version = _data.version;
					if (version) {
						event.reply("update-available/response", {
							data: { version: version },
						});
					}
				}
			} catch (err) {
				showError(
					err,
					event,
					"Error getting getting update: ",
					"update-available/response",
				);
			}
		});
		// retrieves all blocked sites of a specific group
		ipcMain.on(
			"blockedcontent/get",
			async (
				event: Electron.IpcMainEvent,
				_data: { id: number; group_name: string } | undefined,
			) => {
				try {
					// get the blocked sites of a specific group
					const rows = (await getBlockedContentDataOneGroup(_data)) || [];

					event.reply("blockedcontent/get/response", {
						data: rows,
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error getting block sites: ",
						"blockedcontent/get/response",
					);
				}
			},
		);
		ipcMain.on(
			"blockedcontent/export",
			async (
				event: Electron.IpcMainEvent,
				_data: { id: number; group_name: string } | undefined,
			) => {
				try {
					// get the blocked sites of a specific group
					console.log(_data);

					const rows = (await getBlockedContentDataOneGroup(_data)) || [];
					console.log(rows);

					event.reply("blockedcontent/export/response", {
						data: rows,
						group_name: _data?.group_name,
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error exporting block sites: ",
						"blockedcontent/export/response",
					);
				}
			},
		);
		ipcMain.on("jiyuu/export", async (event: Electron.IpcMainEvent) => {
			try {
				const blocked_content_rows = (await getBlockedContentDataAll()) || [];
				console.log(blocked_content_rows);

				const res = new Map<string, string[]>();

				for (let i = 0; i < blocked_content_rows.length; i++) {
					const bcn = blocked_content_rows[i].group_name;

					const bctt = blocked_content_rows[i].target_text;
					const hasGroupName = res.has(bcn);
					const targetTextList = hasGroupName ? (res.get(bcn) ?? []) : [];
					res.set(bcn, [...targetTextList, bctt]);
				}
				console.log(res);

				const arr_res = Array.from(res, ([k, v]) => ({
					group_name: k,
					contents: v,
				}));
				event.reply("jiyuu/export/response", {
					json_string: JSON.stringify(arr_res),
				});
			} catch (err) {
				showError(
					err,
					event,
					"Error exporting block sites: ",
					"jiyuu/export/response",
				);
			}
		});
		ipcMain.on(
			"jiyuu/import",
			async (event: Electron.IpcMainEvent, _data: { json_string: string }) => {
				try {
					if (!_data) throw "Error no import data";
					if (!_data.json_string) throw "Error no json data";
					const import_data = JSON.parse(_data.json_string) as {
						group_name: string;
						contents: string[];
					}[];
					for (let i = 0; i < import_data.length; i++) {
						let group_name = import_data[i].group_name;
						const rows =
							(await db
								?.selectFrom("block_group")
								.where("group_name", "=", group_name)
								.selectAll()
								.execute()) || [];
						if (rows) group_name = `${group_name} (${rows.length})`;

						await db
							?.insertInto("block_group")
							.values({
								group_name: group_name,
								is_activated: 0,
								is_blurred: 0,
								is_covered: 0,
								is_grayscaled: 0,
								is_muted: 0,
								auto_deactivate: 0,
								restriction_type: null,
								date_created: new Date().toISOString(),
							})
							.returning(["id", "group_name as name"])
							.executeTakeFirstOrThrow();
						const bgId = await db
							?.selectFrom("block_group")
							.select("id")
							.where("group_name", "=", group_name)
							.executeTakeFirstOrThrow();
						if (bgId && bgId.id) {
							const toInsert = import_data[i].contents.map((c) => {
								const is_absolute = c.substring(0, 3) === "{a}";
								const target_text = is_absolute ? c.slice(3) : c;
								return {
									target_text: target_text,
									is_absolute: is_absolute ? (1 as const) : (0 as const),
									block_group_id: bgId.id,
								};
							});
							await db
								?.insertInto("blocked_content")
								.values(toInsert)
								.executeTakeFirstOrThrow();
						}
					}
					event.reply("jiyuu/import/response", {
						info: "successfully imported",
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error exporting block sites: ",
						"jiyuu/import/response",
					);
					// resend the updated block
					const r = await getBlockGroup_with_config();
					// console.log("blockgorup: ", r);

					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);

		// retrieve all the blockgroup
		ipcMain.on("blockgroup/get", async (event: Electron.IpcMainEvent) => {
			try {
				const r = await getBlockGroup_with_config();
				event.reply("blockgroup/get/response", { data: r });
			} catch (err) {
				showError(
					err,
					event,
					"Error getting block groups: ",
					"blockgroup/get/response",
				);
			}
		});

		// retrieve a blockgroup with corresponding id
		ipcMain.on(
			"blockgroup/get/id",
			async (event: Electron.IpcMainEvent, _data) => {
				try {
					const { id } = _data;
					if (!id) throw new Error("ID is required");
					// const row = db
					//     ?.prepare("SELECT * FROM block_group WHERE id = ?")
					//     .get(id) as BlockGroup;
					const row = (
						await db
							?.selectFrom("block_group")
							.selectAll()
							.where("id", "=", id)
							.execute()
					)?.[0];
					if (!row) throw new Error(`Block group with ID ${id} not found`);
					event.reply("blockgroup/get/id/response", { data: row });
				} catch (err) {
					showError(
						err,
						event,
						"Error getting block group by ID: ",
						"blockgroup/get/id/response",
					);
				}
			},
		);

		// put/create a new blockgroup
		ipcMain.on(
			"blockgroup/put",
			async (event: Electron.IpcMainEvent, _data) => {
				try {
					const { group_name } = _data as { group_name: string };
					if (!(_data && group_name && group_name.length > 0))
						throw "No group name input";

					// const rows = (getBlockGroup()?.all() as Array<BlockGroup>) || [];
					const rows =
						(await db?.selectFrom("block_group").selectAll().execute()) || [];

					for (let r of rows) {
						if (group_name === r.group_name) throw `Group name already exist!`;
					}

					// db?.prepare("INSERT INTO block_group(group_name) VALUES(?)").run(
					//     _data.group_name,
					// );
					await db
						?.insertInto("block_group")
						.values({
							group_name: group_name,
							is_activated: 0,
							is_blurred: 0,
							is_covered: 0,
							is_grayscaled: 0,
							is_muted: 0,
							auto_deactivate: 0,
							restriction_type: null,
							date_created: new Date().toISOString(),
						})
						.returning(["id", "group_name as name"])
						.executeTakeFirstOrThrow();
					// console.log("group: ", res);

					event.reply("blockgroup/put/response", {
						info: `Group ${group_name} added.`,
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error creating block group: ",
						"blockgroup/put/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					// console.log("blockgorup: ", r);

					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);

		// sets a block group
		ipcMain.on("blockgroup/set", async (event: Electron.IpcMainEvent, data) => {
			try {
				const { group, new_group_name } = data as {
					group: block_group;
					new_group_name: string;
				};

				await setBlockGroup(group, new_group_name);

				event.reply("blockgroup/set/response", { info: "Successful" });
			} catch (err) {
				showError(
					err,
					event,
					"Error setting block group: ",
					"blockgroup/set/response",
				);
			} finally {
				// resend the updated block
				const r = await getBlockGroup_with_config();
				mainWindow.webContents.send("blockgroup/get/response", {
					data: r,
				});
			}
		});

		// delete a block group and corresponding blocked sites of that group
		ipcMain.on(
			"blockgroup/delete",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { id } = data as { id: number };
					console.log(id);

					if (!id)
						throw "Invalid data provided for deleting block group and blocked sites data";
					console.log(id);

					await blockGroupDelete(id);
					event.reply("blockgroup/delete/response", {
						info: "Deleted successfully",
					});
				} catch (err) {
					showError(
						err,
						event,
						"There was an error deleting block group including blocked sites data: ",
						"blockgroup/delete/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);

		// on a particular block group, set all the blocked sites on any changes made by the user
		ipcMain.on(
			"blockgroup_blockedcontent/set",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { group, blocked_content_data } = data as {
						group: BlockGroup_Full;
						blocked_content_data: blocked_content[];
					};

					// for block group all the configs like is_covered, etc
					setBlockGroup(group);

					// delete blocked sites of that group first to start fresh
					await db
						?.deleteFrom("blocked_content")
						.where("block_group_id", "=", group.id)
						.execute();
					const whitelist_to_be_deleted: Set<string> = new Set();
					const whitelist_rows = await get_whitelist_all();
					for (const s of blocked_content_data) {
						const content_is_url = isURL(s.target_text);
						const cleaned_target_text = cleanURL(s.target_text);
						// then insert the latest collections
						await db
							?.insertInto("blocked_content")
							.values({
								target_text: s.target_text,
								block_group_id: s.block_group_id,
								is_absolute: s.is_absolute,
							})
							.execute();

						// lastly delete any whitelisted items that is present in this blocked contents
						for (const v of whitelist_rows) {
							const cleaned_item = cleanURL(v.item);
							if (
								content_is_url &&
								cleaned_item.length > 0 &&
								cleaned_target_text.length > 0 &&
								cleaned_item === cleaned_target_text
							) {
								whitelist_to_be_deleted.add(v.item);
							} else if (v.item.includes(s.target_text)) {
								whitelist_to_be_deleted.add(v.item);
							}
						}
					}
					// delete all whitelisted items that is affected by this newly added blocked content
					for (const v of [...whitelist_to_be_deleted]) {
						await db
							?.deleteFrom("whitelist")
							.where("item", "=", v)
							.executeTakeFirstOrThrow();
					}

					event.reply("blockgroup_blockedcontent/set/response", {
						info: "MODIFYING THE ENTIRE GROUP SUCCESS",
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error setting both the block group and blocked sites data: ",
						"blockgroup_blockedcontent/set/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);
		ipcMain.on(
			"blockgroupconfig/get",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { id, config_type } = data as {
						id: number;
						config_type: ConfigType;
					};
					// console.log("data: ", data);
					if (!(id && config_type)) throw "invalid post input...";

					const row = await db
						?.selectFrom("block_group_config")
						.where("block_group_id", "=", id)
						.where("config_type", "=", config_type)
						.selectAll()
						.execute();

					event.reply("blockgroupconfig/get/response", {
						data: row ? row[0] : null,
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error setting up group config",
						"blockgroupconfig/get/response",
					);
				}
			},
		);
		ipcMain.on(
			"blockgroupconfig/usageLimit/pause/set",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					let { id, pauseLength } = data as {
						// group id and pause_number
						id: number;
						pauseLength: number;
					};
					if (!(id && pauseLength)) throw "invalid pause input... (1)";
					if (pauseLength <= 0) throw "invalid pause input... (2)";

					const r = await db
						?.selectFrom("block_group_config")
						.selectAll()
						.where("block_group_id", "=", id)
						.where("config_type", "=", "usageLimit")
						.executeTakeFirst();
					if (!r) throw "theres no usage limit for this group";

					const config_data = JSON.parse(r.config_data) as
						| UsageLimitData_Config
						| Password_Config
						| RestrictTimer_Config
						| RandomText_Config;

					if (config_data.config_type !== "usageLimit")
						throw "not a usage limit (3)";

					config_data.pause_until = new Date().getTime() + pauseLength;

					await db
						?.updateTable("block_group_config")
						.set({ config_data: JSON.stringify(config_data) })
						.where("block_group_id", "=", id)
						.where("config_type", "=", "usageLimit")
						.executeTakeFirst();

					await db
						?.updateTable("block_group")
						.set({ is_activated: 0 })
						.where("id", "=", id)
						.executeTakeFirst();

					event.reply("blockgroupconfig/usageLimit/pause/set/response", {
						info: "operation success",
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error setting up group config",
						"blockgroupconfig/usageLimit/pause/set/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);
		ipcMain.on(
			"blockgroupconfig/set",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					let json_object = "";
					let { id, config_data } = data as {
						// group id and config data
						id: number;
						config_data:
							| UsageLimitData_Config
							| RestrictTimer_Config
							| Password_Config
							| RandomText_Config;
					};
					if (!(id && config_data)) throw "invalid post input...";
					if (config_data.config_type === "usageLimit") {
						const r = await db
							?.selectFrom("block_group_config")
							.select("config_data")
							.where("block_group_id", "=", id)
							.where("config_type", "=", "usageLimit")
							.executeTakeFirst();
						let pause_until = 0;

						// if theres an existing pause, keep it
						if (r && r.config_data) {
							const old_cd = JSON.parse(r.config_data) as UsageLimitData_Config;
							pause_until = Math.max(old_cd.pause_until || 0, pause_until);
						}

						const timeLeft =
							config_data.usage_reset_value_mode === "minute"
								? config_data.usage_reset_value * 60
								: config_data.usage_reset_value_mode === "hour"
									? config_data.usage_reset_value * 3600
									: config_data.usage_reset_value;
						// update the config table with the followin data
						json_object = JSON.stringify({
							...config_data,
							usage_time_left: timeLeft,
							last_updated_date: new Date().toISOString(),
							pause_until: pause_until,
						});
					} else if (config_data.config_type === "password") {
						json_object = JSON.stringify(config_data);
					} else if (config_data.config_type === "restrictTimer") {
						const start_date = new Date();
						if (start_date > config_data.end_date) throw "Invalid date";
						json_object = JSON.stringify(config_data);
					} else if (config_data.config_type === "randomText") {
						json_object = JSON.stringify(config_data);
					} else throw "the config type is invalid: " + config_data;
					console.log("the json object => ", json_object);

					await db
						?.insertInto("block_group_config")
						.values({
							block_group_id: id,
							config_type: config_data.config_type,
							config_data: json_object,
						})
						.onConflict((oc) => {
							return oc.columns(["block_group_id", "config_type"]).doUpdateSet({
								config_data: json_object,
							});
						})
						.execute();
					// 	db?.prepare(
					// 		`
					// 	INSERT OR REPLACE INTO block_group_config(block_group_id, config_type, config_data)
					// 	VALUES(?, ?, ?)
					// `,
					// 	).run(id, config_data.config_type, json_object);
					if (config_data.config_type !== "usageLimit") {
						// db?.prepare(
						// 	"UPDATE block_group SET restriction_type = ? WHERE id = ?",
						// ).run(config_data.config_type, id);
						await db
							?.updateTable("block_group")
							.set({ restriction_type: config_data.config_type })
							.where("id", "=", id)
							.executeTakeFirst();
					}

					event.reply("blockgroupconfig/set/response", {
						info: "operation success",
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error setting up group config",
						"blockgroupconfig/set/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);
		ipcMain.on(
			"blockgroupconfig/delete",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { id, config_data } = data as {
						id: number;
						config_data:
							| UsageLimitData_Config
							| RestrictTimer_Config
							| Password_Config
							| RandomText_Config;
					};
					if (!(id && config_data)) throw "invalid post input...";
					await db
						?.deleteFrom("block_group_config")
						.where("block_group_id", "=", id)
						.where("config_type", "=", config_data.config_type)
						.executeTakeFirst();
					await db
						?.updateTable("block_group")
						.set({ restriction_type: null })
						.where("id", "=", id)
						.executeTakeFirst();
					// db?.prepare(
					// 	`
					// 		DELETE FROM block_group_config
					// 		WHERE
					// 			block_group_id = ? AND
					// 			config_type = ?
					// 		`,
					// ).run(id, config_data.config_type);
					// db?.prepare(
					// 	"UPDATE block_group SET restriction_type = null WHERE id = ?",
					// ).run(id);
					event.reply("blockgroupconfig/delete/response", {
						info: "operation success",
					});
				} catch (err) {
					showError(
						err,
						event,
						"Error setting up group config",
						"blockgroupconfig/delete/response",
					);
				} finally {
					// resend the updated block
					const r = await getBlockGroup_with_config();
					mainWindow.webContents.send("blockgroup/get/response", {
						data: r,
					});
				}
			},
		);
		ipcMain.on("dashboard/get", async (event: Electron.IpcMainEvent) => {
			try {
				const mode = await getDashboardDateMode();
				const d = await getDashboardSummarized(mode);
				const c = await getClicksSummarized(mode);
				const g = await getBlockGroupTimeUsage(mode);
				event.reply("dashboard/get/response", {
					data: {
						clicksSummarized: c,
						usageLogSummarized: d,
						groupTimeSummarized: g,
					},
				});
			} catch (err) {
				showError(
					err,
					event,
					"Error getting dashboard",
					"dashboard/get/response",
				);
			}
		});
		ipcMain.on("useroptions/get", async (event: Electron.IpcMainEvent) => {
			try {
				const d = await db
					?.selectFrom("user_options")
					.selectAll()
					.executeTakeFirst();

				event.reply("useroptions/get/response", {
					data: {
						dashboardDateMode: d?.dashboardDateMode || null,
						secondsUntilClosed: d?.secondsUntilClosed,
						blockUnsupportedBrowser: d?.blockUnsupportedBrowser,
						blockEmulators: d?.blockEmulators,
						selectedTheme: d?.selectedTheme,
					},
				});
			} catch (err) {
				showError(
					err,
					event,
					"Error getting dashboard",
					"useroptions/get/response",
				);
			}
		});
		ipcMain.on(
			"useroptions/set",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { dashboardDateMode } = data as {
						dashboardDateMode: "d" | "w" | "m";
					};
					if (!dashboardDateMode) throw "The dashboard datemode input is empty";
					console.log("the dashbaorddatemode: ", dashboardDateMode);

					await db
						?.updateTable("user_options")
						.set({ dashboardDateMode: dashboardDateMode })
						.executeTakeFirst();
					event.reply("useroptions/set/response", {});
				} catch (err) {
					showError(
						err,
						event,
						"Error getting dashboard",
						"useroptions/set/response",
					);
				}
			},
		);
		ipcMain.on(
			"configoptions/set",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const {
						secondsUntilClosed,
						blockUnsupportedBrowser,
						blockEmulators,
						selectedTheme,
					} = data as {
						secondsUntilClosed: number;
						blockUnsupportedBrowser: 0 | 1;
						blockEmulators: 0 | 1;
						selectedTheme: string;
					};

					await db
						?.updateTable("user_options")
						.set({
							blockUnsupportedBrowser: blockUnsupportedBrowser,
							secondsUntilClosed: secondsUntilClosed,
							blockEmulators: blockEmulators,
							selectedTheme: selectedTheme,
						})
						.executeTakeFirst();
					event.reply("configoptions/set/response", {});
				} catch (err) {
					showError(
						err,
						event,
						"Error getting dashboard",
						"configoptions/set/response",
					);
				}
			},
		);
		ipcMain.on("whitelist/get", async (event: Electron.IpcMainEvent) => {
			try {
				const rows = await db?.selectFrom("whitelist").selectAll().execute();
				event.reply("whitelist/get/response", { data: rows });
			} catch (error) {
				showError(
					error,
					event,
					"Error fetching whitelist",
					"whitelist/get/response",
				);
			}
		});
		ipcMain.on(
			"whitelist/delete",
			async (event: Electron.IpcMainEvent, data) => {
				try {
					const { item } = data as { item: string };

					// Dont delete if theres nothing in the data about this particular item
					if (!(await whitelist_does_exist(item))) {
						throw "item does not exist";
					}
					await db
						?.deleteFrom("whitelist")
						.where("item", "=", item)
						.executeTakeFirst();
					event.reply("whitelist/delete/response", {});
				} catch (err) {
					showError(
						err,
						event,
						"Error deleting item",
						"whitelist/delete/response",
					);
				} finally {
					const r = await db?.selectFrom("whitelist").selectAll().execute();
					mainWindow.webContents.send("whitelist/get/response", {
						data: r,
					});
				}
			},
		);
		ipcMain.on("usagedata/delete", async (event: Electron.IpcMainEvent) => {
			try {
				await db?.deleteFrom("usage_log").execute();
				await db?.deleteFrom("block_group_usage_log").execute();
				event.reply("usagedata/delete/response", {});
			} catch (err) {
				showError(
					err,
					event,
					"Error deleting item",
					"usagedata/delete/response",
				);
			}
		});
		ipcMain.on("whitelist/put", async (event: Electron.IpcMainEvent, data) => {
			try {
				const { item, whitelist_type } = data as whitelist_put_type;
				if (!item) throw "item is empty";
				// TODO: check if the item is app or url or keyword
				// if web check if theres a current item in whitelist db
				if (await whitelist_does_exist(item)) {
					throw "item already exist!";
				}
				// check if it is in some blockgroups
				const s = await whitelist_is_in_blockgroup(item);
				if (s.is_included) {
					throw `item is present in group: ${s.included_blockgroups.toString()}`;
				}
				await whitelist_put({ item, whitelist_type });
				event.reply("whitelist/put/response", {});
			} catch (err) {
				showError(
					err,
					event,
					"Error putting whitelist:",
					"whitelist/put/response",
				);
			} finally {
				const r = await db?.selectFrom("whitelist").selectAll().execute();
				console.log(r);

				mainWindow.webContents.send("whitelist/get/response", {
					data: r,
				});
			}
		});
		// if (!isAutoStart) {
		// 	createWindow();
		// }
		createWindow();
		app.on("activate", function () {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
			else {
				if (process.platform === "darwin") {
					app.show();
				} else {
					mainWindow.show();
				}
				mainWindow.focus();
			}
		});

		app.on("before-quit", () => {
			isQuitting = true;
			if (tray) {
				tray.destroy();
			}
			if (wss) {
				wss.close(() => {
					console.log("websocket server closed");
				});
			}
		});

		const wss = new WebSocketServer({ port: 7071 });
		wss.on("connection", (ws, req) => {
			console.log("connection from:", req.socket.remoteAddress);
			ws.on("message", async (message) => {
				try {
					const data = JSON.parse(message.toString()) as
						| isPing
						| isTimelist
						| isWebpage;
					// check if the data passed is a webpage, the app is supposed to monitor and validate a tab/webpage
					if (data.sendType === "isWebpage") {
						if (data.data) {
							const d = data.data;
							const validateResult = await validateWebpage({
								tabId: data.tabId,
								data: d,
							});
							ws.send(validateResult);

							// then update the clickcount
							await updateClickCount(data.data);

							// then get the summary dashboard
							const mode = await getDashboardDateMode();
							const dashboardRes = await getDashboardSummarized(mode);
							const clicksRes = await getClicksSummarized(mode);
							const groupTimeRes = await getBlockGroupTimeUsage(mode);
							// send it to react ui, do this every time a user access a new website
							mainWindow.webContents.send("dashboard/get/response", {
								data: {
									usageLogSummarized: dashboardRes,
									clicksSummarized: clicksRes,
									groupTimeSummarized: groupTimeRes,
								},
							});
						}
					}

					// if just logging the time, add it first to the global queue (edit 8/27/25,
					// global queue doesnt work in electron, it causes heap overload.. the only way to just stick
					// with accepting websocket msg from multiple source

					// the time logged may cause duplication if using multiple different browsers at the samew time
					else if (data.sendType === "isTimelist") {
						let ua_string = data.userAgent ? (data.userAgent as string) : "";
						let name = findBrowser(ua_string);
						// console.log("PING AGENT: " + name);
						// console.log("DATA: " + data.data[0]);

						for (const b of browsers_list) {
							if (b.name === name) {
								// if incognito access is allowed, reset the filling timer
								if (data.isAllowedIncognitoAccess) {
									b.elapsedMissing = 0;
								}
							}
						}
						// update the time
						const map = new Map<string, TimeListInterface>(
							Object.entries(data.data),
						);
						if (map.size > 0) {
							console.log("map: ", map);

							await validateTimelist(map);

							// once the log is fresh, check if blockable
							for (const v of map.values()) {
								const r = await validateWebpage({ data: v, tabId: v.tabId });
								ws.send(r);
							}
						}
					}
					//else if (data.sendType === "isPing") {
					// 	let ua_string = data.userAgent ? (data.userAgent as string) : "";
					// 	let name = findBrowser(ua_string);
					// 	console.log("PING AGENT: " + ua_string + "\nNAME: " + name);

					// 	for (const b of browsers_list) {
					// 		if (b.name === name) {
					// 			// if incognito access is allowed, reset the filling timer
					// 			if (data.isAllowedIncognitoAccess) {
					// 				b.elapsedMissing = 0;
					// 			}
					// 		}
					// 	}
					// }
				} catch (e) {
					const errorMsg = e instanceof Error ? e.message : String(e);
					console.error("WebSocket message parsing error: ", errorMsg);
				}
			});
		});
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async () => {
	if (process.platform !== "darwin") {
		if (isQuitting) {
			await db?.destroy();
			app.quit();
		}
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
