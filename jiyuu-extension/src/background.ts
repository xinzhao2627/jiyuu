import browser from "webextension-polyfill";
interface;
console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
	console.log("Extension installed:", details);
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
	try {
		const feedback = await reqManipulate(activeInfo);
		if (!feedback) {
			console.info(
				"reqManipulate from the onActivatedListener not sent to the server"
			);
			return;
		}
		// sends the web content in the electron backend server
		sendMessage({
			isWebpage: true,
			data: feedback.data,
			tabId: activeInfo.tabId,
		});
	} catch (error) {
		console.error("Error in Activated listener: ", error);
	}
});

async function reqManipulate(
	activeInfo: browser.Tabs.OnActivatedActiveInfoType
) {
	return new Promise((resolve, reject) => {
		browser.tabs.get(activeInfo.tabId).then(async (tab) => {
			try {
				// make sure the tab is not one of the systems tab
				if (tab.url && tab.id && /^https?:\/\//.test(tab.url)) {
					// load the content.js in the tab
					await browser.scripting.executeScript({
						target: { tabId: tab.id },
						files: ["content.js"],
					});
					// sends the url in content js and get the web content/details as feedback
					const feedback = await browser.tabs.sendMessage(
						activeInfo.tabId,
						{
							getBlockData: true,
							data: {
								tabUrl: tab.url,
							},
						}
					);
					if (feedback.status !== 200)
						throw new Error(feedback.error);
					resolve(feedback);
				} else {
					resolve(null);
				}
			} catch (error) {
				console.error("FEEDBACK ERROR (REQ MANIPULATE): ", error);
				resolve(null);
			}
		});
	});
}

async function sendMessage(data) {
	try {
		// if the websocket is not yet initialized, run it
		if (!(_socket && _socket.readyState === WebSocket.OPEN)) {
			console.log("no socket yet, initializing...");

			await connectWebSocket();
		}

		// if websocket is running, send the parameter to
		if (_socket && _socket.readyState === WebSocket.OPEN) {
			_socket.send(JSON.stringify(data));
		} else {
			console.warn(_socket.readyState);
		}
	} catch (error) {
		console.log("error from sendMessage");

		throw error;
	}
}
