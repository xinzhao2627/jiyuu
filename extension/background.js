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
				const r = await chrome.tabs.sendMessage(activeInfo.tabId, {
					validateBlock: true,
					data: {
						tabUrl: tab.url,
					},
				});
				console.log("r: ", r);
			}
		} catch (error) {
			console.warn("WARN: ", error);
		}
	});
}
