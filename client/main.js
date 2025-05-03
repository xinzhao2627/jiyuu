// console.log("hello from electron");

const { app, BrowserWindow, session } = require("electron");
const url = require("url");
const path = require("path");
// const { log } = require("console");
const createWindow = () => {
  let win = new BrowserWindow({
    width: 1200,
    height: 700,
  });
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/client/browser/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );
  win.webContents.openDevTools();
  win.on("closed", function () {
    win = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows() === 0) createWindow();
  });
  console.log("activatedd");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
