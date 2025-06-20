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
// const connections: WebSocket[] = [];
// let connections: WebSocket[] = [];
let db: BetterSqlite3.Database | undefined;
interface SiteAttribute {
	desc: string;
	keywords: string;
	url: string;
	title: string;
	descDoc: string;
	keywordsDoc: string;
}
interface BlockedSites {
	target_text: string;
	block_group_id: number;
}
interface BlockParameters {
	is_grayscaled: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	is_activated: 0 | 1;
}
interface BlockGroup extends BlockParameters {
	id: number;
	group_name: string;
}

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
	initBlockGroup();
	initBlockedSitesData();
	initUsageLog();
	// IPC test
	ipcMain.on("blockgroup/get", (event: Electron.IpcMainEvent, _data) => {
		try {
			const rows = getBlockGroup()?.all() || [];
			event.reply("blockgroup/get/response", { data: rows });
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			event.reply("blockgroup/get/response", { error: errorMsg, data: [] });
		}
	});
	// ipcMain.on("hi", (event: Electron.IpcMainEvent, _) => console.log("pipip"));

	ipcMain.on("blockedsites/get", (event: Electron.IpcMainEvent, _data) => {
		try {
			const rows =
				(getBlockedSitesData(_data)?.all() as Array<BlockedSites>) || [];

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
	ipcMain.on("blockgroup/rename", (event: Electron.IpcMainEvent, data) => {
		try {
			const { group_id, old_group_name, new_group_name } = data;
			if (!(group_id && old_group_name && new_group_name))
				throw "Invalid data provided for renaming block group";

			if (old_group_name === new_group_name) {
				event.reply("blockgroup/rename", {
					info: "No changes were made as the new group name is the same as the old one.",
				});
				return;
			}

			db
				?.prepare("UPDATE block_group SET group_name = ? WHERE id = ?")
				.run(new_group_name, group_id);
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			console.error("error renaming in blockgroup: ", errorMsg);
			event.reply("blockgroup/rename", { error: errorMsg });
		}
	});
	ipcMain.on(
		"BlockGroupAndBlockedSitesData/delete",
		(event: Electron.IpcMainEvent, data) => {
			try {
				const { id } = data;
				if (!id)
					throw "Invalid data provided for deleting block group and blocked sites data";

				deleteBlockGroupAndBlockedSitesData(id);
				event.reply("BlockGroupAndBlockedSitesData/delete/response", {});
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				console.error(
					"There was an error deleting block group including blocked sites data: ",
					errorMsg,
				);
				event.reply("BlockGroupAndBlockedSitesData/set/response", {
					error: errorMsg,
				});
			}
		},
	);

	ipcMain.on(
		"BlockGroupAndBlockedSitesData/set",
		(event: Electron.IpcMainEvent, data) => {
			try {
				const {
					group_id,
					blocked_sites_data,
					is_grayscaled,
					is_covered,
					is_muted,
				} = data;
				console.log(data);

				// for block group
				db
					?.prepare(
						"UPDATE block_group SET is_grayscaled = ?, is_covered = ?, is_muted = ? WHERE id = ?",
					)
					.run(
						is_grayscaled ? 1 : 0,
						is_covered ? 1 : 0,
						is_muted ? 1 : 0,
						group_id,
					);

				db
					?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?")
					.run(group_id);

				// for blocked sites
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

				event.reply("BlockGroupAndBlockedSitesData/set/response", {});
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				console.error(
					"There was an error setting both the block gorup and blocked siotes data: ",
					errorMsg,
				);
				event.reply("BlockGroupAndBlockedSitesData/set/response", {
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

function validateWebpage(data, ws): void {
	const siteData: SiteAttribute = data.data;
	try {
		// get all blocked sites and their corresponding effects (grayscale, cover, mute)
		const rows =
			(db
				?.prepare(
					`SELECT 
										bs.target_text, bg.is_grayscaled, 
										bg.is_covered, bg.is_muted, 
										bg.group_name, bg.is_activated
									FROM blocked_sites as bs 
									INNER JOIN block_group as bg ON 
										bg.id = bs.block_group_id`,
				)
				.all() as Array<{
				target_text: string;
				is_grayscaled: 0 | 1;
				is_covered: 0 | 1;
				is_muted: 0 | 1;
				group_name: string;
				is_activated: 0 | 1;
			}>) || [];

		let grayscale_count = 0;
		let muted_count = 0;
		let covered_count = 0;
		const following_detected_texts: string[] = [];

		// check if the any of the sites attribute matched any of the keywords in blocked_sites
		for (let r of rows) {
			const isact = r.is_activated;
			const target = r.target_text;
			if (
				(isact && siteData.desc.includes(target)) ||
				siteData.keywords.includes(target) ||
				siteData.title.includes(target) ||
				siteData.url.includes(target)
			) {
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

function getBlockedSitesData(_data): Statement<unknown[], unknown> | undefined {
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

function getBlockGroup(): Statement<unknown[], unknown> | undefined {
	return db?.prepare("SELECT * FROM block_group");
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
				is_grayscaled INTEGER DEFAULT 1,
				is_covered INTEGER DEFAULT 0,
				is_muted Integer DEFAULT 0,
				is_activated Integer DEFAULT 0
			)`,
		)
		.run();
}
function initUsageLog(): void {
	db
		?.prepare(
			`CREATE TABLE IF NOT EXISTS usage_log (
				id INTEGER PRIMARY KEY,
				web_url TEXT NOT NULL,
				web_content TEXT,
				time_start TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
				time_end TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
				time_total_seconds INTEGER NOT NULL
			)`,
		)
		.run();
}

function deleteBlockGroupAndBlockedSitesData(id): void {
	db?.prepare("DELETE FROM blocked_sites WHERE block_group_id = ?").run(id);
	db?.prepare("DELETE FROM block_group WHERE id = ?").run(id);
}
