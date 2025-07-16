/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

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
// const connections: WebSocket[] = [];
// let connections: WebSocket[] = [];
let db: BetterSqlite3.Database | undefined;

function createWindow(): void {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
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
							"SELECT id, is_grayscaled, is_covered, is_muted FROM block_group WHERE id = ?",
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

			if (
				config_type === "usageLimit" ||
				config_type === "password" ||
				config_type === "randomText" ||
				config_type === "restrictTimer"
			) {
				const row = db
					?.prepare(
						`
					SELECT * FROM block_group_config WHERE block_group_id = ? AND config_type = ?
				`,
					)
					.get(id, config_type);
				// console.log("row: ", row);

				event.reply("blockgroupconfig/get/response", { data: row ? row : {} });
			} else throw "the config type is invalid: " + config_type;
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
							usage_time_left: config_data.usage_reset_value,
						}),
					);
			} else if (
				config_data.config_type === "password" ||
				config_data.config_type === "randomText" ||
				config_data.config_type === "restrictTimer"
			) {
				console.log("not yet finish");
			} else throw "the config type is invalid: " + config_data;
		} catch (err) {
			showError(
				err,
				event,
				"Error setting up group config",
				"blockgroupconfig/set",
			);
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
function validateTimelist(data, ws): void {
	// the site data here is multiple,
	// meaning there could be more than 1 tabs that are sent

	try {
		// console.log(data);
		const siteData = new Map<string, TimeListInterface>(
			Object.entries(data.data),
		);
		// remove tabs with 0 secons consumption
		function removeNoConsumptions(): void {
			const keylist = siteData.keys();
			for (let sd of keylist) {
				if (!siteData.get(sd)?.secondsElapsed) {
					siteData.delete(sd);
				}
			}
		}
		removeNoConsumptions();

		// TODO: then log the sites in siteData to the usage table (done)
		function logToUsageLog(): void {
			const insert = db?.prepare(`
				INSERT INTO usage_log(base_url, full_url, recorded_day, recorded_hour, recorded_month, recorded_year, seconds_elapsed)
				VALUES (@base_url, @full_url, @recorded_day, @recorded_hour, @recorded_month, @recorded_year, @seconds_elapsed)
			`);
			// sitesdatas
			const insertMany = db?.transaction((sds: Array<TimeListInterface>) => {
				for (let sd of sds) {
					if (sd.baseUrl && sd.fullUrl) {
						console.log("sdd: ", sd);

						const res = {
							base_url: sd.baseUrl,
							full_url: sd.fullUrl,
							recorded_day: sd.day,
							recorded_hour: sd.hour,
							recorded_month: sd.month,
							recorded_year: sd.year,
							seconds_elapsed: sd.secondsElapsed,
						};
						insert?.run(res);
					}
				}
			});
			if (insertMany) {
				insertMany([...siteData.values()]);
			}
		}
		logToUsageLog();

		// then get all listed sites/keyword in jiyuu
		const rows =
			(getBlockedSitesDataAll()?.all() as Array<BlockedSites_with_configs>) ||
			[];

		// loops all listed sites/keywords and determine their <group_id, seconds>
		const blockGroupsList = new Map<number, number>();
		for (let r of rows) {
			const isact = r.is_activated;
			const target = r.target_text;

			for (let [k, v] of siteData) {
				// if one of the tab is included in the active block...
				if (siteIncludes(v, target, 1)) {
					let s = blockGroupsList.get(r.block_group_id);

					// get the corresponding blockgroup/s of the data
					// add the each elapsed seconds into corresponding blockgroup
					// set the maximum secondsElapsed (if there area any duplicates)
					blockGroupsList.set(
						r.block_group_id,
						s ? Math.max(s, v.secondsElapsed) : v.secondsElapsed,
					);
				}
			}
		}
		console.log("available block lists... ", blockGroupsList);

		// TODO:  with the collected blockgroups list, update the time usage in config table
		function updateUsage(): void {
			console.log("updating...");
			for (const [k, v] of blockGroupsList) {
				const configRow = db
					?.prepare(
						"SELECT config_type, config_data, block_group_id FROM block_group_config WHERE block_group_id = ? AND config_type = 'usageLimit'",
					)
					.get(k) as {
					config_type: ConfigType;
					config_data: string;
					block_group_id: number;
				};
				if (!configRow) {
					continue;
				}
				const usageLimitData = JSON.parse(
					configRow.config_data,
				) as UsageLimitData_Config;

				// here just edit the timeleft, leave the other config data as it is
				const timeLeft = usageLimitData.usage_time_left - v;
				const newConfig: UsageLimitData_Config = {
					...usageLimitData,
					usage_time_left: timeLeft < 0 ? 0 : timeLeft,
				};

				// if this group has no time left, activate its block
				if (newConfig.usage_time_left <= 0) {
					db
						?.prepare("UPDATE block_group SET is_activated = 1 WHERE id = ?")
						.run(k);
				}
				db
					?.prepare(
						"UPDATE block_group_config SET config_data = ? WHERE block_group_id = ? AND config_type = 'usageLimit'",
					)
					.run(JSON.stringify(newConfig), k);
			}
		}
		updateUsage();
		// then validate if its blocked or not
		for (let [k, v] of siteData) {
			validateWebpage({ data: v, tabId: v.tabId }, ws);
		}
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		console.error("Validate timelist error: ", errorMsg);
	}
}

// validates 1 site/webpage
function validateWebpage(data, ws): void {
	try {
		const siteData: SiteAttribute | TimeListInterface = data.data;
		const tabId: number = data.tabId;

		// get all blocked sites and their corresponding effects (grayscale, cover, mute)
		const rows =
			(getBlockedSitesDataAll()?.all() as Array<BlockedSites_with_configs>) ||
			[];

		let grayscale_count = 0;
		let muted_count = 0;
		let covered_count = 0;

		// list of sites/keywords that are blocked
		const following_detected_texts: string[] = [];

		// check if the any of the sites attribute matched any of the keywords in blocked_sites
		for (let r of rows) {
			const isact = r.is_activated;
			const target = r.target_text;
			if (siteIncludes(siteData, target, isact)) {
				// and if matches, get the effects
				console.log("found");
				console.log(r);

				grayscale_count += r.is_grayscaled;
				muted_count += r.is_muted;
				covered_count += r.is_covered;
				following_detected_texts.push(r.target_text);
			}
		}
		let is_blocked = covered_count + muted_count + grayscale_count > 0;
		console.log({
			tabId: tabId,
			isBlocked: is_blocked,
			message: is_blocked
				? "Blocking will proceed..."
				: "Not blocking this webpage",
			following_detected_texts: following_detected_texts,
			blockParam: {
				is_covered: covered_count > 0 ? 1 : 0,
				is_muted: muted_count > 0 ? 1 : 0,
				is_grayscaled: grayscale_count > 0 ? 1 : 0,
			},
		});

		ws.send(
			JSON.stringify({
				tabId: tabId,
				isBlocked: is_blocked,
				message: is_blocked
					? "Blocking will proceed..."
					: "Not blocking this webpage",
				following_detected_texts: following_detected_texts,
				blockParam: {
					is_covered: covered_count > 0 ? 1 : 0,
					is_muted: muted_count > 0 ? 1 : 0,
					is_grayscaled: grayscale_count > 0 ? 1 : 0,
				},
			}),
		);
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error("Unable to block sites, cause: ", errorMsg);
	}
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function getBlockedSitesDataOneGroup(
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
function getBlockedSitesDataAll(): Statement<unknown[], unknown> | undefined {
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

function getBlockGroup(): Statement<unknown[], unknown> | undefined {
	return db?.prepare("SELECT * FROM block_group");
}
function setBlockGroup(
	group: BlockGroup,
	new_group_name: string | undefined = undefined,
): void {
	if (!group) throw "Invalid data provided for renaming block group";

	// if rename config exists and wants to rename, then rename
	const name =
		new_group_name && group.group_name !== new_group_name
			? new_group_name
			: group.group_name;

	db
		?.prepare(
			`UPDATE block_group 
					SET 
						group_name = ?, 
						is_activated = ?, 
						is_grayscaled = ?, 
						is_covered = ?, 
						is_muted = ? 
					WHERE id = ?`,
		)
		.run(
			name,
			group.is_activated,
			group.is_grayscaled,
			group.is_covered,
			group.is_muted,
			group.id,
		);
}

function initBlockedSitesData(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS blocked_sites(
				target_text text NOT NULL,
				block_group_id INTEGER NOT NULL REFERENCES block_group(id),
				PRIMARY KEY (target_text, block_group_id),
				FOREIGN KEY (block_group_id) REFERENCES block_group(id)
			);`,
		)
		.run();
}

function initBlockGroup(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS block_group(
				id INTEGER PRIMARY KEY,
				group_name VARCHAR(255) NOT NULL,
				is_grayscaled INTEGER DEFAULT 0,
				is_covered INTEGER DEFAULT 0,
				is_muted Integer DEFAULT 0,
				is_activated Integer DEFAULT 0
			)`,
		)
		.run();
}
function initBlockGroupConfig(): void {
	db?.prepare(
		`CREATE TABLE IF NOT EXISTS block_group_config (
			id INTEGER PRIMARY KEY,
			block_group_id INTEGER NOT NULL REFERENCES block_group(id),
			config_type VARCHAR(255),
			config_data JSON,
			FOREIGN KEY (block_group_id) REFERENCES block_group(id)
		)`,
	);
}
function initUsageLog(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS usage_log (
					id INTEGER PRIMARY KEY,
					base_url TEXT NOT NULL,
					full_url TEXT NOT NULL,
					recorded_day INTEGER NOT NULL,
					recorded_hour INTEGER NOT NULL,
					recorded_month INTEGER NOT NULL,
					recorded_year INTEGER NOT NULL,
					seconds_elapsed INTEGER
			)`,
		)
		.run();
}

function blockGroupDelete(id: number): void {
	db?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?").run(id);
	db
		?.prepare("DELETE FROM block_group_config WHERE block_group_id = ?")
		.run(id);
	db?.prepare("DELETE FROM block_group WHERE id = ?").run(id);
}

function siteIncludes(
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
function showError(
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

// initialize time for today when the app opens, and also initialize it every minute
function initToday(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS date_today (
				id INTEGER PRIMARY KEY,
				recorded_day INTEGER NOT NULL,
				recorded_hour INTEGER NOT NULL,
				recorded_month INTEGER NOT NULL,
				recorded_year INTEGER NOT NULL
			)`,
		)
		.run();
	function insertTodayIfNotExists(): void {
		const d = new Date();
		const today = {
			recorded_day: d.getDate(),
			recorded_hour: d.getHours(),
			recorded_month: d.getMonth() + 1,
			recorded_year: d.getFullYear(),
		};
		const row = db?.prepare(`SELECT * FROM date_today`).get() as {
			id: number;
			recorded_day: number;
			recorded_hour: number;
			recorded_month: number;
			recorded_year: number;
		};
		if (!row) {
			console.log("no date, adding date today...");
			db
				?.prepare(
					`INSERT INTO date_today(recorded_day, recorded_hour, recorded_month, recorded_year) VALUES(?, ?, ?, ?)`,
				)
				.run(
					today.recorded_day,
					today.recorded_hour,
					today.recorded_month,
					today.recorded_year,
				);
		}
	}
	insertTodayIfNotExists();

	// updates the date today every 1 minute
	let lastTime = new Date();
	function recursiveTimeChecker(): void {
		const one_minute = 60 * 1000;
		const currentTime = new Date();

		if (currentTime.getTime() - lastTime.getTime() < one_minute) {
			setTimeout(recursiveTimeChecker, 1000);
			return;
		}
		console.log("renewing date..");

		db
			?.prepare(
				"UPDATE date_today set recorded_day = ?, recorded_hour = ?, recorded_month = ?, recorded_year = ?",
			)
			.run(
				currentTime.getDate(),
				currentTime.getHours(),
				currentTime.getMonth() + 1,
				currentTime.getFullYear(),
			);
		lastTime = currentTime;
		setTimeout(recursiveTimeChecker, one_minute);
	}
	recursiveTimeChecker();
}
