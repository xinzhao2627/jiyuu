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
	SiteAttribute,
	SiteTime,
	SiteTime_with_tabId,
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			console.error("error getting block sites: ", errorMsg);
			event.reply("blockedsites/get/response", { error: errorMsg, data: [] });
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			console.error("error inserting in block_site: ", errorMsg);
			event.reply("blockedsites/put/response", { error: errorMsg });
		}
	});

	// retrieve all the blockgroup
	ipcMain.on("blockgroup/get", (event: Electron.IpcMainEvent, _data) => {
		try {
			const rows = getBlockGroup()?.all() || [];
			event.reply("blockgroup/get/response", { data: rows });
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			event.reply("blockgroup/get/response", { error: errorMsg, data: [] });
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			event.reply("blockgroup/get/id/response", { error: errorMsg });
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			event.reply("blockgroup/put/response", { error: errorMsg, data: [] });
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			console.error("Error in blockgroup: ", errorMsg);
			event.reply("blockgroup/set/response", { error: errorMsg });
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
			const errorMsg = err instanceof Error ? err.message : String(err);
			console.error(
				"There was an error deleting block group including blocked sites data: ",
				errorMsg,
			);
			event.reply("blockgroup/delete/response", {
				error: errorMsg,
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
				const errorMsg = err instanceof Error ? err.message : String(err);
				console.error(
					"There was an error setting both the block gorup and blocked sites data: ",
					errorMsg,
				);
				event.reply("blockgroup_blockedsites/set/response", {
					error: errorMsg,
				});
			}
		},
	);

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
				console.log("e: ", e);
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
		console.log(data);
		const siteData = new Map<string, SiteTime_with_tabId>(
			Object.entries(data.data),
		);
		// const tabId: number = data.tabId;

		function removeNoConsumptions(): void {
			const keylist = siteData.keys();
			for (let sd of keylist) {
				if (!siteData.get(sd)!.secondsElapsed) {
					siteData.delete(sd);
				}
			}
		}
		removeNoConsumptions();

		// get all listed sites/keyword in jiyuu
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
				if (siteIncludes(v, target, isact)) {
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

		// TODO: then log the sites in siteData to the usage table
		// TODO:  with the collected blockgroups list, update the time usage

		// then validate if its blocked or not
		for (let [k, v] of siteData) {
			validateWebpage({ data: v, tabId: v.tabId }, ws);
		}
	} catch (error) {
		const errMsg = error instanceof Error ? error.message : String(error);
		console.log("validate timelist error: ", errMsg);
	}
}

// validates 1 site/webpage
function validateWebpage(data, ws): void {
	try {
		const siteData: SiteAttribute | SiteTime | SiteTime_with_tabId = data.data;
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
				grayscale_count += r.is_grayscaled;
				muted_count += r.is_muted;
				covered_count += r.is_covered;
				following_detected_texts.push(r.target_text);
			}
		}
		let is_blocked = covered_count + muted_count + grayscale_count > 0;
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
		console.log(
			"unable to block sites, cause: ",
			err instanceof Error ? err.message : String(err),
		);
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
				bg.group_name, bg.is_activated
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
					recorded_month INTEGER NOT NULL
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
	siteData: SiteAttribute | SiteTime,
	target: string,
	isact: 0 | 1,
): boolean {
	return (
		(isact && siteData.desc?.includes(target)) ||
		siteData.keywords?.includes(target) ||
		siteData.title?.includes(target) ||
		siteData.url?.includes(target)
	);
}

// initialize time for today when the app opens, and also initialize it every minute
function initToday(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS date_today (
				id INTEGER PRIMARY KEY,
				day_number INTEGER NOT NULL,
				hour_number INTEGER NOT NULL
			)`,
		)
		.run();
	const d = new Date();
	const today = {
		day: d.getDate(),
		hour: d.getHours() + 1,
	};
	const row = db?.prepare(`SELECT * FROM date_today`).get() as {
		id: number;
		day_number: number;
		hour_number: number;
	};
	if (!row) {
		console.log("no date, adding date today...");
		db
			?.prepare(`INSERT INTO date_today(day_number, hour_number) VALUES(?, ?)`)
			.run(today.day, today.hour);
	} // else {
	// 	console.log(
	// 		`today is ${today}.. the one in the database is ${row.day_number} ${row.hour_number}`,
	// 	);
	// 	if (row.date_number !== today) {
	// 		console.log("replacing day to: ", today);
	// 		db?.prepare("UPDATE date_today set date_number = ?").run(today);
	// 	}
	// }
	let lastTime = new Date();
	const one_minute = 60 * 1000;
	function recursiveTimeChecker(): void {
		const currentTime = new Date();

		if (currentTime.getTime() - lastTime.getTime() < one_minute) {
			setTimeout(recursiveTimeChecker, 1000);
			return;
		}
		console.log("renewing date..");

		db
			?.prepare("UPDATE date_today set day_number = ?, hour_number = ?")
			.run(currentTime.getDate(), currentTime.getHours() + 1);
		lastTime = currentTime;
		setTimeout(recursiveTimeChecker, one_minute);
	}
	recursiveTimeChecker();
}
