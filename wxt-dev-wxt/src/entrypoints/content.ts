import { ExtensionMessage, Message } from "@webext-core/messaging";
import { BlockParam, Feedback, SentData } from "../assets/interfaces";
import { defineExtensionMessaging } from "@webext-core/messaging";

export interface ProtocolMap {
	getStringLength(s: string): number;
	getBlockData(d: { tabUrl: string; tabId: number }): Feedback;
	toBlockData(d: BlockParam): Feedback;
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ProtocolMap>();
export default defineContentScript({
	matches: ["http://*/*", "https://*/*"],
	main() {
		console.log("Hello content.");
		onMessage("getBlockData", (message) => {
			const s = manipulate(message);
			return s;
		});
		onMessage("toBlockData", (message) => {
			const s = blockProcessor(message.data);
			return s;
		});
		// sendMessage("getStringLength", "ss");
	},
});
function blockProcessor(blockParam: BlockParam): Feedback {
	try {
		console.log("gs called: ", blockParam);

		if (blockParam.is_muted) blockMute();
		if (blockParam.is_covered) blockOverride();

		if (blockParam.is_grayscaled && blockParam.is_blurred)
			blockGrayscaleBlur();
		else if (blockParam.is_grayscaled) blockGrayscale();
		else if (blockParam.is_blurred) blockBlur();

		return {
			status: 200,
			data: null,
			error: "",
		};
	} catch (e) {
		return {
			status: 401,
			error: e instanceof Error ? e.message : (e as string),
			data: null,
		};
	}
}
function manipulate(
	message: Message<ProtocolMap, "getBlockData"> & ExtensionMessage
): Feedback {
	try {
		console.log("the script is running!!");

		const data = message.data;
		let descDoc = document.querySelector("meta[name='description']") || "";
		let keywordsDoc = document.querySelector("meta[name='keywords']") || "";

		const desc =
			typeof descDoc !== "string"
				? descDoc.getAttribute("content")?.toLowerCase() || ""
				: "";
		const keywords =
			typeof keywordsDoc !== "string"
				? keywordsDoc.getAttribute("content")?.toLowerCase() || ""
				: "";

		let title = document.title?.toLowerCase() || "";
		let siteContent = {
			desc: desc,
			keywords: keywords,
			url: data.tabUrl,
			title: title,
			// descDoc: descDoc,
			// keywordsDoc: keywordsDoc,
		};
		console.log("sending messgae!: ", siteContent);

		return { status: 200, data: siteContent, error: "" };
	} catch (e) {
		return {
			status: 400,
			data: null,
			error: e instanceof Error ? e.message : (e as string),
		};
	}
}
function blockBlur() {
	document.documentElement.style.filter = "blur(5px)";
}

function blockGrayscale() {
	document.documentElement.style.filter = "grayscale(100%)";
}

function blockGrayscaleBlur() {
	document.documentElement.style.filter = "blur(5px) grayscale(100%)";
}

function blockOverride() {
	let OVERRIDE = `
        <html>
            <head>
                <title>Custom Page</title>
                <style>
                    body {
                        font-family: Roboto, roboto, sans-serif;
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
	const observer = new MutationObserver(() => {
		setTimeout(() => {
			document.querySelectorAll("audio, video").forEach((el) => {
				const mediaEl = el as HTMLMediaElement;
				mediaEl.muted = true;
				mediaEl.volume = 0;
			});
		}, 1500);
	});
	observer.observe(document.body, { childList: true, subtree: true });
}
