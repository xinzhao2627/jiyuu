import { useEffect, useState } from "react";

export interface Notif {
	id: string;
	type: string;
	title?: string;
	summary: string;
	date: string;
	url?: string;
	tag?: string;
	badgeColor?: string;
}

const FEED_URL =
	import.meta.env.VITE_FEED_API_URL ||
	"https://jiyuublocker.vercel.app/feed.json";
const ONE_HOUR = 60 * 60 * 1000;

const MOCK_NOTIFS: Notif[] = [
	{
		id: "rel-1-2-0",
		type: "release",
		summary: "Added support for Brave browser and updated blocking engine.",
		date: new Date().toISOString(),
		url: "https://jiyuublocker.vercel.app/releases/v1-2-0",
		tag: "Update",
		badgeColor: "primary",
	},
	{
		id: "roadmap-2026-q4",
		type: "roadmap",
		title: "2026 Q4 Roadmap & Upcoming Apps",
		summary: "Check out what features and companion apps are coming next.",
		date: "2026-08-20T00:00:00Z",
		url: "https://jiyuublocker.vercel.app/roadmap",
		tag: "Roadmap",
		badgeColor: "secondary",
	},
];

export default function Notification(): React.JSX.Element {
	const [, setNotifs] = useState<Notif[]>(() => {
		try {
			const cached = localStorage.getItem("JIYUU_NOTIFS");
			return cached ? (JSON.parse(cached) as Notif[]) : [];
		} catch {
			return [];
		}
	});

	useEffect(() => {
		let timerId: ReturnType<typeof setTimeout> | undefined;

		const callFeed = async (): Promise<void> => {
			try {
				let data: Notif[];

				if (import.meta.env.DEV) {
					data = MOCK_NOTIFS;
				} else {
					const response = await fetch(FEED_URL, {
						signal: AbortSignal.timeout(8000),
					});
					if (!response.ok) {
						throw new Error(`Feed fetch failed with HTTP ${response.status}`);
					}
					data = (await response.json()) as Notif[];
				}

				setNotifs(data);
				localStorage.setItem("JIYUU_NOTIFS", JSON.stringify(data));
				localStorage.setItem(
					"NOTIF_TIME_LAST_CHECKED",
					new Date().toISOString(),
				);
				window.dispatchEvent(new Event("jiyuu-feed-updated"));
			} catch (error) {
				console.error("callFeed error:", error);
			}
		};

		const checkFeed = async (): Promise<void> => {
			const time = localStorage.getItem("NOTIF_TIME_LAST_CHECKED");

			if (time) {
				const lastChecked = new Date(time).getTime();
				const now = Date.now();
				const timeDiff = now - lastChecked;

				if (timeDiff >= ONE_HOUR) {
					await callFeed();
					timerId = setTimeout(() => void checkFeed(), ONE_HOUR);
				} else {
					timerId = setTimeout(
						() => void checkFeed(),
						Math.max(0, ONE_HOUR - timeDiff),
					);
				}
			} else {
				await callFeed();
				timerId = setTimeout(() => void checkFeed(), ONE_HOUR);
			}
		};

		void checkFeed();

		return () => {
			if (timerId) clearTimeout(timerId);
		};
	}, []);

	return <></>;
}
