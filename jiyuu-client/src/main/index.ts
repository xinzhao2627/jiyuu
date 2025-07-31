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
import Database from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import {
	BlockedSites,
	BlockGroup,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "../lib/jiyuuInterfaces";
import {
	initBlockedSitesData,
	initBlockGroup,
	initBlockGroupConfig,
	initToday,
	initUsageLog,
} from "./initializations";
import {
	blockGroupDelete,
	getBlockGroup,
	setBlockGroup,
	updateBlockGroup,
} from "./methods/functionsBlockGroup";
import { getBlockedSitesDataOneGroup } from "./methods/functionBlockedSites";
import {
	showError,
	// taskIncludes_win,
	taskKiller_win,
} from "./methods/functionHelper";
import {
	validateTimelist,
	validateWebpage,
} from "./methods/functionsExtensionReceiver";
import { getBlockGroup_with_config } from "./methods/functionConfig";
export let db: BetterSqlite3.Database | undefined;
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
		mainWindow.show();
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
app.whenReady().then(() => {
	// Set app user model id for windows
	createTray();
	electronApp.setAppUserModelId("com.jiyuu");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// initialize sqlite
	const dbPath = app.isPackaged
		? join(app.getPath("userData"), "jiyuuData.db")
		: join(__dirname, "../../src/main/jiyuuData.db");
	db = new Database(dbPath);

	// triggers when opening the app
	try {
		initToday();
		initBlockGroup();
		initBlockGroupConfig();
		initBlockedSitesData();
		initUsageLog();
		console.log("initialization done");

		let lt = new Date();
		// refreshes the group every 1 second
		function recursiveGroupChecker(): void {
			const ct = new Date();
			if (ct.getTime() - lt.getTime() < 1000) {
				setTimeout(recursiveGroupChecker, 100);
				return;
			}
			lt = ct;
			updateBlockGroup();
			const r = getBlockGroup_with_config();
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
			setTimeout(recursiveGroupChecker, 1000);
		}
		recursiveGroupChecker();
	} catch (e) {
		console.log(e);
	}

	// retrieves all blocked sites of a specific group
	ipcMain.on("blockedsites/get", (event: Electron.IpcMainEvent, _data) => {
		try {
			// get the blocked sites of a specific group
			const rows =
				(getBlockedSitesDataOneGroup(_data)?.all() as Array<BlockedSites>) ||
				[];

			// Also get block group settings if specific group is requested
			let blockGroupSettings: unknown = null;
			if (_data.id) {
				blockGroupSettings =
					db
						?.prepare(
							"SELECT id, is_grayscaled, is_covered, is_muted, is_blurred FROM block_group WHERE id = ?",
						)
						.get(_data.id) || null;
			}

			event.reply("blockedsites/get/response", {
				data: rows,
				blockGroupSettings: blockGroupSettings,
			});
		} catch (err) {
			showError(
				err,
				event,
				"Error getting block sites: ",
				"blockedsites/get/response",
			);
		}
	});

	// insert one blocksite/keywrod into a specific blockgroup, not yet used as of 6/29/25
	ipcMain.on("blockedsites/put", (event: Electron.IpcMainEvent, data) => {
		try {
			console.log("put block sites", { a: data.target_text, b: data.group_id });

			db?.prepare(
				"INSERT INTO blocked_sites(target_text, block_group_id) VALUES(?, ?)",
			).run(data.target_text, data.group_id);
			event.reply("blockedsites/put/response", { error: "" });
		} catch (err) {
			showError(
				err,
				event,
				"Error inserting in block_site: ",
				"blockedsites/put/response",
			);
		}
	});

	// retrieve all the blockgroup
	ipcMain.on("blockgroup/get", (event: Electron.IpcMainEvent) => {
		try {
			const r = getBlockGroup_with_config();
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
	ipcMain.on("blockgroup/get/id", (event: Electron.IpcMainEvent, _data) => {
		try {
			const { id } = _data;
			if (!id) throw new Error("ID is required");
			const row = db
				?.prepare("SELECT * FROM block_group WHERE id = ?")
				.get(id) as BlockGroup;
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
	});

	// put/create a new blockgroup
	ipcMain.on("blockgroup/put", (event: Electron.IpcMainEvent, _data) => {
		try {
			if (!_data.group_name) throw "No group name input";

			const rows = (getBlockGroup()?.all() as Array<BlockGroup>) || [];

			for (let r of rows) {
				if (_data.group_name === r.group_name)
					throw `Group name already exist (${_data.group_name}, ${r.group_name})`;
			}

			db?.prepare("INSERT INTO block_group(group_name) VALUES(?)").run(
				_data.group_name,
			);
			event.reply("blockgroup/put/response", {
				info: `Group ${_data.group_name} added.`,
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
			const r = getBlockGroup_with_config();
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
		}
	});

	// sets a block group
	ipcMain.on("blockgroup/set", (event: Electron.IpcMainEvent, data) => {
		try {
			const { group, new_group_name } = data as {
				group: BlockGroup;
				new_group_name: string;
			};

			setBlockGroup(group, new_group_name);

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
			const r = getBlockGroup_with_config();
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
		}
	});

	// delete a block group and corresponding blocked sites of that group
	ipcMain.on("blockgroup/delete", (event: Electron.IpcMainEvent, data) => {
		try {
			const { id } = data as { id: number };
			if (!id)
				throw "Invalid data provided for deleting block group and blocked sites data";
			console.log(id);

			blockGroupDelete(id);
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
			const r = getBlockGroup_with_config();
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
		}
	});

	// on a particular block group, set all the blocked sites on any changes made by the user
	ipcMain.on(
		"blockgroup_blockedsites/set",
		(event: Electron.IpcMainEvent, data) => {
			try {
				const { group, blocked_sites_data } = data as {
					group: BlockGroup;
					blocked_sites_data: Array<BlockedSites>;
				};
				console.log(data);

				// for block group
				setBlockGroup(group);

				// delete blocked sites of that group first to start fresh
				db?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?").run(
					group.id,
				);

				// then insert the latest collections
				const inserter = db?.prepare(
					"INSERT OR IGNORE INTO blocked_sites(target_text, block_group_id) VALUES(@target_text, @block_group_id)",
				);
				const insertMany = db?.transaction((blocked_sites: BlockedSites[]) => {
					for (let s of blocked_sites) {
						inserter?.run(s);
					}
				});
				if (insertMany) {
					insertMany(blocked_sites_data);
				} else throw "Error, the database is not initialized properly";

				event.reply("blockgroup_blockedsites/set/response", {
					info: "MODIFYING THE ENTIRE GROUP SUCCESS",
				});
			} catch (err) {
				showError(
					err,
					event,
					"Error setting both the block group and blocked sites data: ",
					"blockgroup_blockedsites/set/response",
				);
			} finally {
				// resend the updated block
				const r = getBlockGroup_with_config();
				mainWindow.webContents.send("blockgroup/get/response", {
					data: r,
				});
			}
		},
	);
	ipcMain.on("blockgroupconfig/get", (event: Electron.IpcMainEvent, data) => {
		try {
			const { id, config_type } = data as {
				id: number;
				config_type: string;
			};
			// console.log("data: ", data);
			if (!(id && config_type)) throw "invalid post input...";

			const row = db
				?.prepare(
					`
						SELECT * FROM block_group_config 
						WHERE 
							block_group_id = ? AND 
							config_type = ? 
						`,
				)
				.get(id, config_type);
			// console.log("row: ", row);

			event.reply("blockgroupconfig/get/response", {
				data: row ? row : {},
			});
		} catch (err) {
			showError(
				err,
				event,
				"Error setting up group config",
				"blockgroupconfig/get/response",
			);
		}
	});
	ipcMain.on("blockgroupconfig/set", (event: Electron.IpcMainEvent, data) => {
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
				const timeLeft =
					config_data.usage_reset_value_mode === "minute"
						? config_data.usage_reset_value * 60
						: config_data.usage_reset_value_mode === "hour"
							? config_data.usage_reset_value * 120
							: config_data.usage_reset_value;
				// update the config table with the followin data
				json_object = JSON.stringify({
					...config_data,
					usage_time_left: timeLeft,
					last_updated_date: new Date().toISOString(),
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
			db?.prepare(
				`
				INSERT OR REPLACE INTO block_group_config(block_group_id, config_type, config_data)
				VALUES(?, ?, ?)
			`,
			).run(id, config_data.config_type, json_object);
			if (config_data.config_type !== "usageLimit") {
				db?.prepare(
					"UPDATE block_group SET restriction_type = ? WHERE id = ?",
				).run(config_data.config_type, id);
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
			const r = getBlockGroup_with_config();
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
		}
	});
	ipcMain.on(
		"blockgroupconfig/delete",
		(event: Electron.IpcMainEvent, data) => {
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
				db?.prepare(
					`
						DELETE FROM block_group_config 
						WHERE 
							block_group_id = ? AND 
							config_type = ? 
						`,
				).run(id, config_data.config_type);
				db?.prepare(
					"UPDATE block_group SET restriction_type = null WHERE id = ?",
				).run(id);
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
				const r = getBlockGroup_with_config();
				mainWindow.webContents.send("blockgroup/get/response", {
					data: r,
				});
			}
		},
	);
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
	});

	const wss = new WebSocketServer({ port: 8080 });

	wss.on("connection", (ws, req) => {
		console.log("connection from:", req.socket.remoteAddress);

		ws.on("message", (message) => {
			try {
				const data = JSON.parse(message.toString());
				// check if the data passed is a webpage, the app is supposed to monitor and validate a tab/webpage
				if (data.isWebpage) {
					validateWebpage(data, ws);
				}
				// if just logging the time, do this instead
				else if (data.isTimelist) {
					validateTimelist(data, ws);
				}
				// if the allow in incognito is disabled...
				else if (data.isIncognitoMessage) {
					if (!data.isAllowedIncognitoAccess && data.userAgent) {
						let ua_string = data.userAgent as string;
						let name = "";
						if (ua_string.includes("chrome")) name = "chrome";
						else if (ua_string.includes("firefox")) name = "firefox";
						else if (ua_string.includes("brave")) name = "brave";
						else if (ua_string.includes("edg/")) name = "msedge";

						const restrictDelay = Number(
							(
								db
									?.prepare(
										"SELECT opt_val FROM options WHERE opt_type = 'restrictDelay'",
									)
									.get() as { opt_val: string }
							)?.opt_val,
						);
						if (name) {
							setTimeout(() => {
								taskKiller_win(name);
							}, restrictDelay || 60000);
						}
					}
				}
			} catch (e) {
				const errorMsg = e instanceof Error ? e.message : String(e);
				console.error("WebSocket message parsing error: ", errorMsg);
				console.log("Received non-JSON message:", message.toString());
			}
		});
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		if (isQuitting) {
			db?.close();
			app.quit();
		}
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
