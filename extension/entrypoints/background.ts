import { browser } from "wxt/browser";

import type {
	Feedback,
	Feedback_data,
	SentData,
	TimeListData,
} from "../assets/interfaces/extension-interface";
import { sendMessage } from "./content";

export default defineBackground(() => {
	let _socket: WebSocket | null = null;
	let lastLogTime = new Date();
	let timeList = new Map<string, TimeListData>();
	// let lastPingTime = new Date();
	browser.runtime.onInstalled.addListener((details) => {
		console.log("Extension installed:", details);
	});
	async function init_intervals() {
		// pingServer();
		incrementor();
		await log_to_server();
	}
	init_intervals().catch(console.error);

	// sends information to the server every 4 to 5 seconds
	async function log_to_server() {
		const currentTime = new Date();
		const elapsedGeneral = currentTime.getTime() - lastLogTime.getTime();

		// if its not yet 5 secs come back again shortly
		if (elapsedGeneral < 5000) {
			setTimeout(log_to_server, 100);
			return;
		}
		// console.log("log to server runnin");
		try {
			// this will run after 5 seconds elapsed from the lastLogTime and the currentTime
			browser.tabs.query({ active: true }).then(async (tabs) => {
				for (let tab of tabs) {
					// make sure the active tab is not a system tab
					if (
						tab &&
						tab.url &&
						tab.id &&
						/^https?:\/\//.test(tab.url)
					) {
						// get the content of that tab
						const feedback = (await reqManipulate({
							tabId: tab.id,
						})) as Feedback;
						if (!(feedback && feedback.data)) {
							continue;
						}
						const baseUrl = getBaseUrl(tab);
						const tabData = timeList.get(baseUrl);

						const d: TimeListData = {
							...tabData,
							...feedback.data,
							secondsElapsed: tabData?.secondsElapsed || 0,
							startTime: tabData?.startTime || currentTime,
							tabId: tabData?.tabId
								? tabData.tabId
								: tab.id
								? tab.id
								: 0,
							dateObject: currentTime.toISOString(),
							baseUrl: baseUrl,
							fullUrl: tab.url ? tab.url : "",
							lastLogTime: tabData?.lastLogTime || currentTime,
						};

						// put the content here, as well as initialize the seconds and startTime to prevent NaN
						timeList.set(tab.url, d);
					}
				}
			});
			// finally send it to server and empty the timelist records (do this if its already connected to the database)
			// use await here or not?
			let userAgent = navigator.userAgent.toLowerCase();

			const navBrave = (navigator as any).brave;

			if (
				(typeof navBrave?.isBrave === "function" &&
					(await navBrave.isBrave())) === true
			) {
				userAgent = "brave";
			}
			const isAllowed =
				await browser.extension.isAllowedIncognitoAccess();

			// console.log(
			// 	"data: " + JSON.stringify(Array.from(timeList.entries()))
			// );

			sendMessageWs({
				sendType: "isTimelist",
				data: Object.fromEntries(timeList),
				userAgent: userAgent,
				isAllowedIncognitoAccess: isAllowed,
			});

			timeList = new Map<string, TimeListData>();
		} catch (error) {
			console.log("sending to server error: ", error);
		} finally {
			lastLogTime = currentTime;

			// repeat again after 5 seconds have passed
			setTimeout(log_to_server, 5000);
		}
	}

	function incrementor() {
		// the get the currentTime, I will use this to subtract from the startingTime
		const currentTime = new Date();

		// get all active tabs
		browser.tabs.query({ active: true }).then((tabs) => {
			for (let tab of tabs) {
				if (tab && tab.id && tab.url && /^https?:\/\//.test(tab.url)) {
					// const baseUrl = getBaseUrl(tab);
					const tabData = timeList.get(tab.url);
					const secondsElapsed = Math.floor(
						(currentTime.getTime() -
							(tabData?.startTime.getTime() ||
								currentTime.getTime())) /
							1000
					);
					const d: TimeListData = {
						secondsElapsed: secondsElapsed,
						startTime: tabData?.startTime || currentTime,
						lastLogTime: currentTime,

						tabId: tab.id,
						dateObject: tabData?.dateObject || "",
						baseUrl: tabData?.baseUrl || "",
						fullUrl: tabData?.fullUrl || "",

						desc: tabData?.desc || "",
						keywords: tabData?.keywords || "",
						url: tabData?.url || "",
						title: tabData?.title || "",
					};
					timeList.set(tab.url, d);
				}
			}
		});

		setTimeout(incrementor, 1000);
	}

	// this runs when a tab is opened or clicked
	browser.tabs.onActivated.addListener(async (activeInfo) => {
		try {
			await tabsListener(activeInfo);
		} catch (error) {
			console.error("Error in Activated listener: ", error);
		}
	});

	// this runs when a tab is refreshed
	browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
		try {
			if (changeInfo.status === "complete") {
				await tabsListener({ tabId: tabId });
			}
		} catch (error) {
			console.error("Error in Activated listener: ", error);
		}
	});
	async function tabsListener(
		activeInfo: globalThis.Browser.tabs.OnActivatedInfo | { tabId: number }
	) {
		const feedback = (await reqManipulate(activeInfo)) as Feedback;
		if (!feedback) {
			console.info(
				"reqManipulate from the onActivatedListener not sent to the server"
			);
			return;
		}
		// sends the web content in the electron backend server
		await sendMessageWs({
			sendType: "isWebpage",
			data: feedback.data,
			tabId: activeInfo.tabId,
		});
	}
	async function reqManipulate(
		activeInfo: Browser.tabs.OnActivatedInfo | { tabId: number }
	) {
		return new Promise((resolve, reject) => {
			browser.tabs.get(activeInfo.tabId).then(async (tab) => {
				try {
					// make sure the tab is not one of the systems tab
					// console.log("the tab: ", tab);
					// console.log("the tab url: ", tab.url);

					if (tab.url && tab.id && /^https?:\/\//.test(tab.url)) {
						const feedback = await sendMessage(
							"getBlockData",
							{
								tabUrl: tab.url,
								tabId: activeInfo.tabId,
							},
							activeInfo.tabId
						);
						console.log("feedback from content.js: ", feedback);

						if (feedback.status !== 200) throw `${feedback.error}`;
						resolve(feedback as Feedback);
					} else {
						resolve(null);
					}
				} catch (error) {
					console.log("FEEDBACK ERROR (REQ MANIPULATE): ", error);
					resolve(null);
				}
			});
		});
	}

	async function sendMessageWs(
		data:
			| {
					sendType: "isWebpage";
					data: Feedback_data | null;
					tabId: number;
			  }
			| {
					sendType: "isTimelist";
					data: { [k: string]: TimeListData };
					userAgent: string;
					isAllowedIncognitoAccess: boolean;
			  }
			| {
					sendType: "isPing";
					isAllowedIncognitoAccess: boolean;
					secondsElapsed: number;
					userAgent: string;
			  }
	) {
		try {
			// if the websocket is not yet initialized, run it
			if (!(_socket && _socket.readyState === WebSocket.OPEN)) {
				console.log("no socket yet, initializing...");

				await connectWebSocket();
			}
			// if websocket is running, send the parameter to
			if (_socket && _socket.readyState === WebSocket.OPEN) {
				// console.log(
				// 	"sending: ... data: ",
				// 	data.sendType === "isTimelist" ? data.data : null
				// );

				_socket.send(JSON.stringify(data));
			} else {
				console.warn(_socket?.readyState);
			}
		} catch (error) {
			console.log("error from sendMessage: " + error);

			// throw error;
		}
	}

	async function connectWebSocket() {
		try {
			// connect to websocket on port 7071
			_socket = new WebSocket("ws://localhost:7071");
			await new Promise((resolve, reject) => {
				if (_socket === null) {
					reject(new Error("websocket it empty"));
					return;
				}
				_socket.onopen = (e) => {
					console.log("websocket open");
					keepAlive();
					resolve(true);
				};
				_socket.onerror = (err) => {
					console.log("websocket onerror: ", err);
					_socket = null;
					reject(new Error("Websocket connection failed"));
				};
			});

			// here we receive any incoming message from backend
			_socket.onmessage = async (event) => {
				const d = JSON.parse(event.data) as SentData;
				// electron will reply if we should block the tab or not
				if (d.isBlocked && d.tabId) {
					console.log("PARAM: " + d.blockParam);

					const feedback = await sendMessage(
						"toBlockData",
						d.blockParam,
						d.tabId
					);
					console.log("feedback from toblockdata: ", feedback);

					if (feedback.status != 200) {
						console.log("status prob: ", feedback.error);
					} else {
						console.log(
							"blocking successfully executed, feedback: ",
							feedback
						);
					}
				} else if (d.tabId && !d.isBlocked) {
					if (d.tabId) {
						console.log(
							`from websocket not blocked, clearing filter: ${d.tabId}`
						);
						const feedback = await sendMessage(
							"clearFilter",
							undefined,
							d.tabId
						);
						if (feedback.status !== 200) {
							console.log(
								"error clearing filter: ",
								feedback.error
							);
						}
					} else {
						console.log(
							"website not blocked, theres also no tab id so unable to clear filter"
						);
					}
				}
			};
			_socket.onclose = () => {
				console.log("connection closed");
				_socket = null;
			};
		} catch (err) {
			console.log("failed to connect", err);
			// throw err;
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

	function getBaseUrl(tab: Browser.tabs.Tab): string {
		const match = tab.url?.match(/^(?:https?:\/\/)?(?:www\.)?([^\/:?#]+)/);
		return match ? match[1] : "";
	}
});
