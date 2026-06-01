import { ExtensionMessage, Message } from "@webext-core/messaging";
import {
	BlockParam,
	Feedback,
	SentData,
} from "../assets/interfaces/extension-interface";
import { defineExtensionMessaging } from "@webext-core/messaging";

export interface ProtocolMap {
	getStringLength(s: string): number;
	getBlockData(d: { tabUrl: string; tabId: number }): Feedback;
	toBlockData(d: BlockParam): Feedback;
	clearFilter(): Feedback;
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
		onMessage("clearFilter", () => {
			const s = filterProcessor();
			return s;
		});
	},
});

function filterProcessor(): Feedback {
	try {
		document.documentElement.style.filter = "";

		return {
			status: 200,
			data: null,
			error: "",
		};
	} catch (e) {
		return {
			status: 400,
			data: null,
			error: e instanceof Error ? e.message : (e as string),
		};
	}
}

function blockProcessor(blockParam: BlockParam): Feedback {
	try {
		console.log("gs called: ", blockParam);
		if (blockParam.is_muted) {
			blockMute();
		}
		if (blockParam.is_covered) {
			blockOverride();
		}

		if (blockParam.is_grayscaled && blockParam.is_blurred) {
			blockGrayscaleBlur();
		} else if (blockParam.is_grayscaled) {
			blockGrayscale();
		} else if (blockParam.is_blurred) {
			blockBlur();
		}
		// visual checker only
		else {
			document.documentElement.style.filter = "";
		}

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
	message: Message<ProtocolMap, "getBlockData"> & ExtensionMessage,
): Feedback {
	try {
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
		// console.log("sending messgae!: ", siteContent);

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
	console.log("blurred running");

	document.documentElement.style.filter = "blur(5px) grayscale(100%)";
}

function blockOverride() {
	const blockedUrl = window.location.href;

	const OVERRIDE = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jiyuu — Blocked</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: #fff;
            color: #0d1b2e;
            font-family: 'Instrument Sans', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          nav {
            padding: 18px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e3eaf4;
          }

          .logo {
            font-size: 20px;
            font-weight: 700;
            color: #1976d2;
            letter-spacing: 1px;
          }

          .nav-chip {
            font-size: 11px;
            font-weight: 500;
            background: #e3f0ff;
            color: #1565c0;
            padding: 3px 10px;
            border-radius: 99px;
            letter-spacing: 0.3px;
          }

          main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 64px 40px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 500;
            color: #1976d2;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 16px;
          }

          h1 {
            font-family: 'Instrument Serif', serif;
            font-size: clamp(100px, 7vw, 58px);
            line-height: 1.08;
            color: #0d1b2e;
            letter-spacing: -0.5px;
            margin-bottom: 18px;
          }

          h1 em {
            color: red;
          }

          p {
            font-size: 20px;
            color: #6b7c93;
            line-height: 1.75;
            max-width: 400px;
            margin-bottom: 36px;
          }

          .url-row {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            background: #f4f7fb;
            border: 1px solid #dce6f0;
            border-radius: 8px;
            padding: 9px 14px;
            max-width: min(460px, 90vw);
          }

          .url-icon {
            color: #90aac8;
            flex-shrink: 0;
          }

          .url-text {
            font-size: 12px;
            color: #6b7c93;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          footer {
            padding: 14px 40px;
            border-top: 1px solid #e3eaf4;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .manage-link {
            font-size: 12px;
            color: #1976d2;
            text-decoration: underline;
            text-underline-offset: 3px;
            cursor: pointer;
          }

          .kanji {
            font-size: 13px;
            color: #c5d3e0;
          }
        </style>
      </head>
      <body>
        <nav>
          <span class="logo">JIYUU</span>
          <span class="nav-chip">Website Blocker</span>
        </nav>

        <main>
          <div class="eyebrow">Access restricted</div>
          <h1>This page<br>is <em>blocked.</em></h1>
          <p>This website is on your blocklist. Jiyuu is keeping you on track — close this tab and get back to it.</p>
          <div class="url-row">
            <svg class="url-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span class="url-text">${blockedUrl}</span>
          </div>
        </main>

        <footer>
          <span class="kanji">自由</span>
        </footer>
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
