import { useEffect } from "react";

export interface Notif {
	id: string;
	type: string;
	title: string;
	message: string;
	markdownMessage: string;
	publishedAt: string;
	url?: string;
}

const NOTIFICATIONS_URL = "https://jiyuublocker.vercel.app/api/notifications";
const ONE_HOUR = 60 * 60 * 1000;

export default function Notification(): React.JSX.Element {
	useEffect(() => {
		let timerId: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;

		const fetchNotifications = async (): Promise<void> => {
			try {
				const response = await fetch(NOTIFICATIONS_URL, {
					signal: AbortSignal.timeout(8000),
				});
				if (!response.ok) {
					throw new Error(`Notifications request failed: ${response.status}`);
				}

				const payload = (await response.json()) as {
					notifications?: Notif[];
				};
				if (!Array.isArray(payload.notifications)) {
					throw new Error("Invalid notifications response");
				}
				if (cancelled) return;

				localStorage.setItem(
					"JIYUU_NOTIFS",
					JSON.stringify(payload.notifications),
				);
				localStorage.setItem(
					"NOTIF_TIME_LAST_CHECKED",
					new Date().toISOString(),
				);
				window.dispatchEvent(new Event("jiyuu-feed-updated"));
			} catch (error) {
				if (!cancelled) console.error("Notifications fetch failed:", error);
			} finally {
				if (!cancelled)
					timerId = setTimeout(() => void fetchNotifications(), ONE_HOUR);
			}
		};

		void fetchNotifications();

		return () => {
			cancelled = true;
			if (timerId) clearTimeout(timerId);
		};
	}, []);

	return <></>;
}
