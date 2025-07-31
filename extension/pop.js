// document.addEventListener("DOMContentLoaded", () => {

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((message, sender) => {
// 	console.log("HAAA");

// 	if (message.popi) {
// 		console.log("YEYE");
// 	}

// 	// if (message.blockedUrl) {
// 	// 	console.log("HAHAHA");

// 	// 	h2Element.textContent = `BLOCKED URL: ${message.blockedUrl}`;
// 	// }
// });
// });
// document.getElementById("hihi").textContent = "yaaa";

document.addEventListener("DOMContentLoaded", () => {
	chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
		const statusElement = document.getElementById("status-text");

		if (isAllowedAccess) {
			statusElement.textContent = "Enabled";
			statusElement.className = "status-value enabled";
		} else {
			statusElement.textContent = "Disabled";
			statusElement.className = "status-value disabled";
		}
	});
});
