/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { WebSocketServer } from "ws";
import sqlite3 from "sqlite3";
// const connections: WebSocket[] = [];
// let connections: WebSocket[] = [];
let db: sqlite3.Database | undefined;
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
    block_group_id: string;
}
interface BlockParameters {
    is_grayscaled: 0 | 1;
    is_covered: 0 | 1;
    is_muted: 0 | 1;
    is_activated: 0 | 1;
}
interface BlockGroup extends BlockParameters {
    id: string;
    group_name: string;
}

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
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
    // console.log("Using DB Path:", [
    //     dbPath,
    //     app.getPath("userData"),
    //     app.isPackaged,
    // ]);
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Failed to open database:", err);
        } else {
            console.log("Database opened successfully.");
        }
    });

    // IPC test
    ipcMain.on("ping", () => console.log("pong"));
    ipcMain.on("blockgroup/get", (event: Electron.IpcMainEvent, _) => {
        // create a default table (block_group) if not exist (nesting the queries because it is asynchrounous)
        db?.run(
            `CREATE TABLE IF NOT EXISTS block_group(
            id INTEGER PRIMARY KEY,
            group_name VARCHAR(255),
            is_grayscaled INTEGER DEFAULT 0,
            is_covered INTEGER DEFAULT 0,
            is_muted Integer DEFAULT 0
        )`,
            (err) => {
                if (err) {
                    return console.error("error creating table: ", err.message);
                }

                db?.all("Select * FROM block_group", (err, rows) => {
                    // if theres no table, insert a default one
                    if (rows.length === 0) {
                        db?.run(
                            "INSERT INTO block_group(group_name) VALUES('group1')",
                            (err) => {
                                if (err) {
                                    return console.error(
                                        "error inserting DEFAULT: ",
                                        err.message,
                                    );
                                } else {
                                    // if no error, return the newly intiialized block_group
                                    db?.all(
                                        "Select * from block_group",
                                        (err, rows) => {
                                            if (err)
                                                event.reply(
                                                    "blockgroup/get/response",
                                                    {
                                                        error: err.message,
                                                        data: [],
                                                    },
                                                );
                                            else
                                                event.reply(
                                                    "blockgroup/get/response",
                                                    { data: rows },
                                                );
                                        },
                                    );
                                }
                            },
                        );
                    } else {
                        // else if there are already rows on the table, return the rows
                        db?.all("Select * from block_group", (err, rows) => {
                            if (err)
                                event.reply("blockgroup/get/response", {
                                    error: err.message,
                                    data: [],
                                });
                            else
                                event.reply("blockgroup/get/response", {
                                    data: rows,
                                });
                        });
                    }
                });
            },
        );
    });
    ipcMain.on("blockedsites/get", (event: Electron.IpcMainEvent, _) => {
        // create a default table (blocked_sites) if not exist (nesting the queries because it is asynchrounous)
        db?.run(
            `CREATE TABLE IF NOT EXISTS blocked_sites(
            target_text text,
            block_group_id INTEGER REFERENCES block_group(id),
            PRIMARY KEY (target_text, block_group_id),
            FOREIGN KEY (block_group_id) REFERENCES block_group(id)
        )`,
            (err) => {
                if (err) {
                    return console.error(
                        "error creating table blocked_sites: ",
                        err.message,
                    );
                }

                db?.all("Select * FROM blocked_sites", (err, rows) => {
                    // if theres no table, insert a default one
                    if (rows.length === 0) {
                        db?.run(
                            "INSERT into blocked_sites(target_text, block_group_id) VALUES ('wuthering', 1)",
                            (err) => {
                                if (err) {
                                    return console.error(
                                        "error inserting DEFAULT: ",
                                        err.message,
                                    );
                                } else {
                                    // if no error, return the newly intiialized block_site
                                    db?.all(
                                        "Select * from blocked_sites",
                                        (err, rows) => {
                                            if (err)
                                                event.reply(
                                                    "blockedsites/get/response",
                                                    {
                                                        error: err.message,
                                                        data: [],
                                                    },
                                                );
                                            else
                                                event.reply(
                                                    "blockedsites/get/response",
                                                    { data: rows },
                                                );
                                        },
                                    );
                                }
                            },
                        );
                    } else {
                        // else if there are already rows on the table, return the rows
                        db?.all("Select * from blocked_sites", (err, rows) => {
                            if (err)
                                event.reply("blockedsites/get/response", {
                                    error: err.message,
                                    data: [],
                                });
                            else
                                event.reply("blockedsites/get/response", {
                                    data: rows,
                                });
                        });
                    }
                });
            },
        );
    });
    ipcMain.on("targettext/put", (event: Electron.IpcMainEvent, data) => {
        db?.run(
            "INSERT INTO blocked_sites(target_text, block_group_id) VALUES(?, ?)",
            [data.target_text, data.group_id],
            (err) => {
                if (err) {
                    console.error(
                        "error inserting in block_site: ",
                        err.message,
                    );
                    event.reply("targettext/put/response", {
                        error: err.message,
                    });
                    return;
                }
                event.reply("targettext/put/response", {
                    error: "",
                });
            },
        );
    });
    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    const wss = new WebSocketServer({ port: 8080 });
    wss.on("connection", (ws, req) => {
        console.log("New connection from:", req.socket.remoteAddress);
        // connections.push(ws);
        // console.log("current connections: ", connections.length);
        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message.toString());
                // console.log(data);

                // check if the data passed is a webpage, the app is supposed to monitor and validate a tab/webpage
                if (data.isWebpage) {
                    const siteData: SiteAttribute = data.data;
                    db?.all(
                        `SELECT 
                            bs.target_text, bg.is_grayscaled, 
                            bg.is_covered, bg.is_muted, 
                            bg.group_name, bg.is_activated
                        FROM blocked_sites as bs 
                        INNER JOIN block_group as bg ON 
                            bg.id = bs.block_group_id`,
                        (
                            err,
                            rows: {
                                target_text: string;
                                is_grayscaled: 0 | 1;
                                is_covered: 0 | 1;
                                is_muted: 0 | 1;
                                group_name: string;
                                block_group_id: number;
                                is_activated: 0 | 1;
                            }[],
                        ) => {
                            if (err) {
                                console.log(
                                    "unable to block sites, cause: ",
                                    err.message,
                                );
                                return;
                            }
                            let grayscale_count = 0;
                            let muted_count = 0;
                            let covered_count = 0;
                            const following_detected_texts: string[] = [];
                            // console.log(rows);

                            for (let r of rows) {
                                // if one of the row's target text is in the tab content:
                                const isact = r.is_activated;
                                const target = r.target_text;
                                // check if is activated and a target text is included in tab content
                                if (
                                    (isact && siteData.desc.includes(target)) ||
                                    siteData.keywords.includes(target) ||
                                    siteData.title.includes(target) ||
                                    siteData.url.includes(target)
                                ) {
                                    console.log("found");

                                    grayscale_count += r.is_grayscaled;
                                    muted_count += r.is_muted;
                                    covered_count += r.is_covered;
                                    following_detected_texts.push(
                                        r.target_text,
                                    );
                                }
                            }
                            let is_blocked =
                                covered_count + muted_count + grayscale_count >
                                0
                                    ? true
                                    : false;
                            ws.send(
                                JSON.stringify({
                                    isBlocked: is_blocked,
                                    message: is_blocked
                                        ? "Blocking will proceed..."
                                        : "Not blocking this webpage",
                                    following_detected_texts:
                                        following_detected_texts,
                                    blockParam: {
                                        is_covered: covered_count > 0 ? 1 : 0,
                                        is_muted: muted_count > 0 ? 1 : 0,
                                        is_grayscaled:
                                            grayscale_count > 0 ? 1 : 0,
                                    },
                                }),
                            );
                        },
                    );
                }

                // if (data.isWebpage) {
                //     const siteData: SiteAttribute = data.data;
                //     if (siteData.url && siteData.url.includes("reddit")) {
                //         const blockParam: BlockParameters = {
                //             is_covered: 0,
                //             is_grayscaled: 1,
                //             is_muted: 1,
                //             is_activated: 1,
                //         };
                //         ws.send(
                //             JSON.stringify({ isBlocked: true, blockParam }),
                //         );
                //     } else {
                //         ws.send(
                //             JSON.stringify({
                //                 isBlocked: false,
                //                 message: "not bloking this webpage",
                //             }),
                //         );
                //     }
                // }
                // console.log("Received from extension: ", d.url);
            } catch (e) {
                console.log("e: ", e);
                console.log("Received non-JSON message:", message.toString());
            }
        });

        // ws.on("tab", (message) => {});
        // ws.send("Hello from Electron app!");
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
