let _socket = null;
// function getWebSocket() {}
async function sendMessage(data) {
	if (!(_socket && _socket.readyState === WebSocket.OPEN)) {
		console.log("no socket yet, initializing...");

		await connectWebSocket();
	}
	if (_socket && _socket.readyState === WebSocket.OPEN) {
		console.log("socket ready, sending data...");

		_socket.send(JSON.stringify(data));
	} else {
		console.warn(_socket.readyState);
	}
}
chrome.tabs.onActivated.addListener(reqManipulate);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		reqManipulate({ tabId });
	}
});

function reqManipulate(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, async (tab) => {
		try {
			if (/^https?:\/\//.test(tab.url)) {
				await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ["content.js"],
				});

				console.log("t");
				const feedback = await chrome.tabs.sendMessage(
					activeInfo.tabId,
					{
						getBlockData: true,
						data: {
							tabUrl: tab.url,
						},
					}
				);
				if (feedback.status !== 200) throw new Error(feedback.e);
				sendMessage({ isWebpage: true, data: feedback.data });
			}
		} catch (error) {
			console.error("WARN: ", error);
		}
	});
}
async function connectWebSocket() {
	try {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onmessage = async (event) => {
			const d = JSON.parse(event.data);
			console.log(d.isBlocked);
			console.log("send from electron: ", d.blockParam);
			if (d.isBlocked) {
				chrome.tabs.query(
					{ active: true, currentWindow: true },
					async (tabs) => {
						if (tabs[0]) {
							try {
								const feedback = await chrome.tabs.sendMessage(
									tabs[0].id,
									{
										toBlockData: true, // meaning this sendMessage will attempt to block the data
										data: d.blockParam,
									}
								);
								console.log("feedback: ", feedback);
							} catch (err) {
								console.error(
									"Error sending block message:",
									err
								);
							}
						}
					}
				);

				console.log("done");
			}
		};
		socket.onerror = (err) => {
			console.log("websocket error", err);
		};

		socket.onclose = () => {
			console.log("disconnected");
		};

		// wait until the socket is open
		await new Promise((resolve) => {
			socket.onopen = () => {
				socket.send(JSON.stringify({ data: "haai" }));
				resolve();
			};
		});
		_socket = socket;
	} catch (err) {
		console.error("failed to connect", err);
		throw err;
	}
}
