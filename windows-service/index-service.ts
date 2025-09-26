import { WebSocketServer } from "ws";

// TODO: impossible, cannot isolate windows-service in chromium
const wss = new WebSocketServer({ port: 7071 });
wss.on("connection", (ws, req) => {
	console.log("connection from: ", req.socket.remoteAddress);
	ws.on("message", async (message) => {
		try {
			// what is being received here are either
			// 1. webcontent from extension/chromium
			// 2. crud request from electron
			const data = JSON.parse(message.toString());
		} catch (error) {
			console.log(error);
		}
	});
});

process.env.APP_DATA;
