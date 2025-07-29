let _socket = null;
chrome.runtime.onStartup.addListener(() => {
	window_started = true;
});
// time list is a map <key_url, blocked_site>
let timeList = new Map();

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
	console.log("log to server runnin");

	try {
		// this will run after 5 seconds elapsed from the lastLogTime and the currentTime
		chrome.tabs.query({ active: true }, async (tabs) => {
			for (let tab of tabs) {
				// make sure the active tab is not a system tab
				if (/^https?:\/\//.test(tab.url)) {
					// get the content of that tab
					const feedback = await reqManipulate({ tabId: tab.id });
					if (!(feedback && feedback.data)) {
						continue;
					}
					const baseUrl = getBaseUrl(tab);
					const tabData = timeList.get(baseUrl);

					// put the content here, as well as initialize the seconds and startTime to prevent NaN
					timeList.set(tab.url, {
						...tabData,
						...feedback.data,
						secondsElapsed: tabData?.secondsElapsed || 0,
						startTime: tabData?.startTime || currentTime,
						tabId: tabData?.tabId ? tabData.tabId : tab.id,
						dateObject: currentTime.toISOString(),
						baseUrl: baseUrl,
						fullUrl: tab.url,
					});
				}
			}
		});
		// finally send it to server and empty the timelist records (do this if its already connected to the database)

		await sendMessage({
			isTimelist: true,
			data: Object.fromEntries(timeList),
		});
		timeList = new Map();
	} catch (error) {
		console.log("sending to server error: ", error);
	} finally {
		lastLogTime = currentTime;

		chrome.extension.isAllowedIncognitoAccess(async (isAllowedAccess) => {
			// if allowed in incognito is disabled, send a warning to the server
			if (!isAllowedAccess) {
				console.error("WARNING: ALLOW INCOGNITO MODE IS DISABLED");
				await sendMessage({
					isIncognitoMessage: true,
					isAllowedIncognitoAccess: isAllowedAccess,
					userAgent: navigator.userAgent.toLowerCase(),
				});
			}
		});
		// repeat again after 5 seconds have passed
		setTimeout(log_to_server, 5000);
	}
}

// every sec increments all active tabs time by 1
function incrementor() {
	// the get the currentTime, I will use this to subtract from the startingTime
	const currentTime = new Date();

	// get all active tabs
	chrome.tabs.query({ active: true }, (tabs) => {
		for (let tab of tabs) {
			if (/^https?:\/\//.test(tab.url)) {
				// const baseUrl = getBaseUrl(tab);
				const tabData = timeList.get(tab.url);
				const secondsElapsed = Math.floor(
					(currentTime - (tabData?.startTime || currentTime)) / 1000
				);
				timeList.set(
					tab.url,
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
	// check if incognito is enabled

	setTimeout(incrementor, 1000);
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

// initialize websocket
async function connectWebSocket() {
	try {
		// connect to websocket on port 8080
		_socket = new WebSocket("ws://localhost:8080");
		await new Promise((resolve, reject) => {
			_socket.onopen = (e) => {
				console.log("websocket open");
				keepAlive();
				resolve();
			};
			_socket.onerror = (err) => {
				console.error("websocket onerror: ", err);
				_socket = null;
				reject(new Error("Websocket connection failed"));
			};
		});

		// here we receive any incoming message from backend
		_socket.onmessage = async (event) => {
			const d = JSON.parse(event.data);
			// electron will reply if we should block the tab or not
			if (d.isBlocked && d.tabId) {
				const feedback = await chrome.tabs.sendMessage(d.tabId, {
					toBlockData: true, // meaning this sendMessage will attempt to block the data
					data: d.blockParam,
				});
				if (feedback.status != 200) {
					console.log("status prob: ", feedback.error);
				} else {
					console.log(
						"blocking successfully executed, feedback: ",
						feedback
					);
				}
			} else {
				console.log(`from websocket not blocked: ${d}`);
			}
		};
		_socket.onclose = () => {
			console.log("connection closed");
			_socket = null;
		};
	} catch (err) {
		console.error("failed to connect", err);
		throw err;
	}
}
function keepAlive() {
	const keepAliveIntervalId = setInterval(
		() => {
			if (_socket) {
				_socket.send(JSON.stringify({ message: "keepalive" }));
			} else {
				clearInterval(keepAliveIntervalId);
			}
		},
		// Set the interval to 20 seconds to prevent the service worker from becoming inactive.
		20 * 1000
	);
}
// minor functions

function getBaseUrl(tab) {
	return tab.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/:?#]+)/)[1];
}

function startTimer(key) {
	timeList.set(key, dayjsMin);
}
