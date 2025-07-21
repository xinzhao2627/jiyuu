/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { isSameDay, isSameHour, isSameWeek } from "date-fns";
import { WebSocketServer } from "ws";
// import sqlite3 from "sqlite3";
import Database, { Statement } from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import { get } from "http";
import {
	BlockedSites,
	BlockedSites_with_configs,
	BlockGroup,
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	SiteAttribute,
	TimeListInterface,
	UsageLimitData_Config,
} from "./jiyuuInterfaces";
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
} from "./functionsBlockGroup";
import { getBlockedSitesDataOneGroup } from "./functionBlockedSites";
import { showError } from "./functionHelper";
import {
	validateTimelist,
	validateWebpage,
} from "./functionsExtensionReceiver";
export let db: BetterSqlite3.Database | undefined;
export let mainWindow: BrowserWindow;
function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
			nodeIntegration: true, //newly
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

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
			const r = getBlockGroup()?.all() || [];
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

			db
				?.prepare(
					"INSERT INTO blocked_sites(target_text, block_group_id) VALUES(?, ?)",
				)
				.run(data.target_text, data.group_id);
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
	ipcMain.on("blockgroup/get", (event: Electron.IpcMainEvent, _data) => {
		try {
			const rows = getBlockGroup()?.all() || [];
			event.reply("blockgroup/get/response", { data: rows });
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

			db
				?.prepare("INSERT INTO block_group(group_name) VALUES(?)")
				.run(_data.group_name);
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
			const r = getBlockGroup()?.all() || [];
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
			const r = getBlockGroup()?.all() || [];
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
			const r = getBlockGroup()?.all() || [];
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
				db
					?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?")
					.run(group.id);

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
				const r = getBlockGroup()?.all() || [];
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
				db
					?.prepare(
						`
							INSERT INTO block_group_config(block_group_id, config_type, config_data)
							VALUES(?, ?, ?)
						`,
					)
					.run(
						id,
						config_data.config_type,
						JSON.stringify({
							...config_data,
							usage_time_left: timeLeft,
							last_updated_date: new Date().toISOString(),
						}),
					);
			} else if (config_data.config_type === "password") {
				db
					?.prepare(
						`
							INSERT INTO block_group_config(block_group_id, config_type, config_data)
							VALUES(?, ?, ?)
						`,
					)
					.run(id, config_data.config_type, JSON.stringify(config_data));
				db
					?.prepare("UPDATE block_group SET is_restricted = 1 WHERE id = ?")
					.run(id);
			} else throw "the config type is invalid: " + config_data;
		} catch (err) {
			showError(
				err,
				event,
				"Error setting up group config",
				"blockgroupconfig/set",
			);
		} finally {
			// resend the updated block
			const r = getBlockGroup()?.all() || [];
			mainWindow.webContents.send("blockgroup/get/response", {
				data: r,
			});
		}
	});

	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
		db?.close();
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
