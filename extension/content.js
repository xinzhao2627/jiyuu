// Check if the current URL matches a specific keyword

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
	if (req.getBlockData) manipulate(req, sender, sendResponse);
	// else sendResponse(req.data);
	else if (req.toBlockData) blockProcessor(req.data, sendResponse);
	return true;
});

async function manipulate(request, sender, sendResponse) {
	try {
		const data = request.data;
		let descDoc = document.querySelector("meta[name='description']");
		let keywordsDoc = document.querySelector("meta[name='keywords']") || "";

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
		sendResponse({ status: 200, data: siteContent });
	} catch (e) {
		sendResponse({ status: 400, error: e.message });
	}
}

function blockGrayscale() {
	document.documentElement.style.filter = "grayscale(100%)";
}

function blockOverride() {
	let OVERRIDE = `
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
	document.documentElement.innerHTML = OVERRIDE;
}

function blockMute() {
	//wdwdwd
	//wdwdwd
}

async function blockProcessor(blockParam, sendResponse) {
	try {
		console.log("gs called: ", blockParam);

		if (blockParam.is_muted) blockMute();
		if (blockParam.is_covered) blockOverride();
		if (blockParam.is_grayscaled) blockGrayscale();
		sendResponse({
			status: 200,
			data: { message: "successfully blocked" },
		});
	} catch (e) {
		sendResponse({ status: 401, error: e.message, data: blockParam });
	}
}
