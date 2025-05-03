// Check if the current URL matches a specific keyword
const OVERRIDE = `
        <html>
            <head>
                <title>Custom Page</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin-top: 50px;
                    }
                </style>
            </head>
            <body>
                <h1>Custom Page</h1>
                <p>This page has been overridden by the extension.</p>
            </body>
        </html>
    `;

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	console.log(
// 		sender.tab
// 			? "from a content script:" + sender.tab.url
// 			: "from the extension"
// 	);
// 	if (request.site && window.location.href.includes(request.site)) {
// 		document.documentElement.style.filter = "grayscale(100%)";
// 	}
// 	sendResponse({ farewell: "goodbye" });
// });
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
	manipulate(req, sender, sendResponse);
	return true;
});

async function manipulate(request, sender, sendResponse) {
	// let siteContent = {
	// 	desc: "",
	// 	keywords: "",
	// 	url: "",
	// 	title: "",
	// 	descDoc: "",
	// 	keywordsDoc: "",
	// };
	// isIncluded(siteContent);
	// sendResponse({ farewell: "goodbye" });

	// check if the message request is to validate url blocking
	try {
		if (request.validateBlock) {
			const data = request.data;
			let descDoc = document.querySelector("meta[name='description']");
			let keywordsDoc =
				document.querySelector("meta[name='keywords']") || "";

			const desc = descDoc
				? descDoc.getAttribute("content").toLowerCase()
				: "";
			const keywords = keywordsDoc
				? keywordsDoc.getAttribute("content").toLowerCase()
				: "";

			let title = document.title?.toLowerCase() || "";
			let siteContent = {
				desc: desc,
				keywords: keywords,
				url: data.tabUrl,
				title: title,
				descDoc: descDoc,
				keywordsDoc: keywordsDoc,
			};
			const { inBlockList, mute, cover, grayscale } = await isIncluded(
				siteContent
			);

			if (inBlockList) {
				if (grayscale) blockGrayscale();
				if (cover) blockOverride();
				if (mute) blockMute();
				// blockOverride();

				sendResponse({ farewell: "site is now blocked/restricted" });
			} else {
				sendResponse({ farewell: "not in blockedlist" });
			}

			// document.body.style.filter = "grayscale(100%)";
		} else sendResponse({ farewell: "no error not validated" });
	} catch (e) {
		sendResponse({ farewell: "error", e: e.message });
	}
}
// function block
async function isIncluded(siteContent) {
	// for (let s of sites) {
	// 	if (url.includes(s)) return true;
	// }
	try {
		const res = await fetch("http://localhost:3700/test", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(siteContent),
		});
		const proceedData = await res.json();
		return proceedData;
	} catch (e) {
		// sendResponse({ farewell: "error isincluded", e: e.message });
		console.error("Error in isIncluded:", e.message);
		return false;
	}
}

function blockGrayscale() {
	document.documentElement.style.filter = "grayscale(100%)";
}

function blockOverride() {
	document.documentElement.innerHTML = OVERRIDE;
}

function blockMute() {
	//wdwdwd
	//wdwdwd
}
