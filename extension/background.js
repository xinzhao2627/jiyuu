// TODO: modify the websocket receiver to block the tabid (line 210+)

console.log("top started");
// time list is a map <key_url, blocked_site>
let timeList = new Map();
let _socket = null;
const interval = 500;
let lastLogTime = new Date();
async function initialize_intervals() {
	incrementor();
	await log_to_server();
}
initialize_intervals().catch(console.error);

// chrome.runtime.onStartup.addListener(async () => {
// 	console.log("From startup listener, starting...");
// 	timeList = new Map();
// 	incrementor();
// 	await log_to_server();
// });

// every 5 sec sends to server the total recorded time of all active tabs from the timelist
async function log_to_server() {
	const currentTime = new Date();

	// if its not yet 5 secs come back again shortly
	if (currentTime - lastLogTime < 5000) {
		setTimeout(log_to_server, 100);
		return;
	}

	// this will run after 5 seconds elapsed from the lastLogTime and the currentTime
	chrome.tabs.query({ active: true }, async (tabs) => {
		for (let tab of tabs) {
			// make sure the active tab is not a system tab
			if (/^https?:\/\//.test(tab.url)) {
				// get the content of that tab
				const feedback = await reqManipulate({ tabId: tab.id });
				if (!(feedback && feedback.data)) {
					console.log("skipping empty content");
					continue;
				}
				const baseUrl = getBaseUrl(tab);
				const tabData = timeList.get(baseUrl);

				// put the content here, as well as initialize the seconds and startTime to prevent NaN
				timeList.set(baseUrl, {
					...tabData,
					...feedback.data,
					secondsElapsed: tabData?.secondsElapsed || 0,
					startTime: tabData?.startTime || currentTime,
					tabId: tabData.tabId ? tabData.tabId : tab.id,
				});
			}
		}
	});
	console.log("From log_to_server list of recorded: ", timeList);
	lastLogTime = currentTime;

	// finally send it to server and empty the timelist records (do this if its already connected to the database)
	async function sendToServer() {
		await sendMessage({ isTimelist: true, data: timeList });
		timeList = new Map();
	}

	await sendToServer();

	// repeat again after 5 seconds have passed
	setTimeout(log_to_server, 5000);
}

// every sec increments all active tabs time by 1
function incrementor() {
	// the get the currentTime, I will use this to subtract from the startingTime
	const currentTime = new Date();

	// get all active tabs
	chrome.tabs.query({ active: true }, (tabs) => {
		for (let tab of tabs) {
			if (/^https?:\/\//.test(tab.url)) {
				const baseUrl = getBaseUrl(tab);
				const tabData = timeList.get(baseUrl);
				const secondsElapsed = Math.floor(
					(currentTime - (tabData?.startTime || currentTime)) / 1000
				);
				timeList.set(
					baseUrl,
					// only update the seconds elapsed, else initialize it
					{
						...tabData,
						// total seconds elapsed
						secondsElapsed: secondsElapsed,
						// the starting time: the starting time where this website was initialized
						startTime: tabData?.startTime || currentTime,
						// the last time the seconds where recorded for this website
						lastLogTime: currentTime,
					}
				);
			}
		}
	});
	console.log("%cincrementor running...", "font-size: 10px");
	setTimeout(incrementor, 1000);
}

async function sendMessage(data) {
	// if the websocket is not yet initialized, run it
	if (!(_socket && _socket.readyState === WebSocket.OPEN)) {
		console.log("no socket yet, initializing...");

		await connectWebSocket();
	}

	// if websocket is running, send the parameter to
	if (_socket && _socket.readyState === WebSocket.OPEN) {
		console.log("socket ready, sending data...");

		_socket.send(JSON.stringify(data));
	} else {
		console.warn(_socket.readyState);
	}
}
chrome.tabs.onActivated.addListener(async (activeInfo) => {
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
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	try {
		if (changeInfo.status === "complete") {
			const feedback = await reqManipulate({ tabId });
			if (!feedback) {
				console.info(
					"reqManipulate from the onUpdatedListener not sent to the server"
				);
				return;
			}
			// sends the web content in the electron backend server
			sendMessage({ isWebpage: true, data: feedback.data, tabId: tabId });
		}
	} catch (error) {
		console.error("Error on Updated Listener: ", error);
	}
});

async function reqManipulate(activeInfo) {
	return new Promise((resolve, reject) => {
		chrome.tabs.get(activeInfo.tabId, async (tab) => {
			try {
				// make sure the tab is not one of the systems tab
				if (/^https?:\/\//.test(tab.url)) {
					// load the content.js in the tab
					await chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: ["content.js"],
					});

					console.log("ACTIVE TAB DETECTED - from reqManipulate()");
					// sends the url in content js and get the web content/details as feedback
					const feedback = await chrome.tabs.sendMessage(
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
					console.log("Tab not examined as it is not a webpage");
					resolve(null);
				}
			} catch (error) {
				console.error("FEEDBACK ERROR (REQ MANIPULATE): ", error);
				resolve(null);
			}
		});
	});
}

// initialize websocket
async function connectWebSocket() {
	try {
		// connect to websocket on port 8080
		const socket = new WebSocket("ws://localhost:8080");

		// here we receive any incoming message from backend
		socket.onmessage = async (event) => {
			const d = JSON.parse(event.data);
			console.log(d.isBlocked);
			console.log("sent from electron: ", d.blockParam);

			// electron will reply if we should block the tab or not
			if (d.isBlocked) {
				chrome.tabs.query(
					{ active: true, currentWindow: true },
					async (tabs) => {
						if (tabs[0]) {
							try {
								// here we will send message to content.js to block the tab with the corresponding configs
								const feedback = await chrome.tabs.sendMessage(
									tabs[0].id,
									{
										toBlockData: true, // meaning this sendMessage will attempt to block the data
										data: d.blockParam,
									}
								);

								// we can see if the block is successful or error based on the feedback message
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

		// log an error if the electron websocket port is offloine
		socket.onerror = (err) => {
			console.error("websocket error", err);
		};

		// log an info if its disconnected otherwise
		socket.onclose = () => {
			console.log("disconnected");
		};

		// wait until the socket is open to give additional buffer window
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

// minor functions

function getBaseUrl(tab) {
	return tab.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/:?#]+)/)[1];
}

function startTimer(key) {
	timeList.set(key, dayjsMin);
}
