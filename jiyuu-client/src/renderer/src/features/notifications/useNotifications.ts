import { useEffect, useState, useCallback } from "react";
import type { Notif } from "../../Notification";

export interface UseNotificationsReturn {
	notifs: Notif[];
	readIds: string[];
	unreadCount: number;
	setRead: (id: string, isRead: boolean) => void;
	markAllAsRead: () => void;
	refresh: () => void;
}

function isNotif(value: unknown): value is Notif {
	if (!value || typeof value !== "object") return false;
	const item = value as Partial<Notif>;
	return (
		typeof item.id === "string" &&
		typeof item.type === "string" &&
		typeof item.title === "string" &&
		typeof item.message === "string" &&
		typeof item.markdownMessage === "string" &&
		typeof item.publishedAt === "string"
	);
}

export function useNotifications(): UseNotificationsReturn {
	const [notifs, setNotifs] = useState<Notif[]>([]);
	const [readIds, setReadIds] = useState<string[]>(() => {
		try {
			const saved = localStorage.getItem("JIYUU_NOTIFS_READ");
			return saved ? (JSON.parse(saved) as string[]) : [];
		} catch {
			return [];
		}
	});

	const loadNotifs = useCallback((): void => {
		try {
			const raw = localStorage.getItem("JIYUU_NOTIFS");
			const saved: unknown = raw ? JSON.parse(raw) : [];
			setNotifs(Array.isArray(saved) ? saved.filter(isNotif) : []);
		} catch {
			setNotifs([]);
		}
	}, []);

	useEffect(() => {
		loadNotifs();

		const handleStorage = (e: StorageEvent): void => {
			if (e.key === "JIYUU_NOTIFS") {
				loadNotifs();
			}
		};

		window.addEventListener("storage", handleStorage);
		const handleFeedUpdate = (): void => loadNotifs();
		window.addEventListener("jiyuu-feed-updated", handleFeedUpdate);

		return () => {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener("jiyuu-feed-updated", handleFeedUpdate);
		};
	}, [loadNotifs]);

	const setRead = (id: string, isRead: boolean): void => {
		const next = isRead
			? Array.from(new Set([...readIds, id]))
			: readIds.filter((readId) => readId !== id);
		setReadIds(next);
		localStorage.setItem("JIYUU_NOTIFS_READ", JSON.stringify(next));
	};

	const markAllAsRead = (): void => {
		const next = Array.from(
			new Set([...readIds, ...notifs.map((item) => item.id)]),
		);
		setReadIds(next);
		localStorage.setItem("JIYUU_NOTIFS_READ", JSON.stringify(next));
	};

	const unreadCount = notifs.filter((n) => !readIds.includes(n.id)).length;

	return {
		notifs,
		readIds,
		unreadCount,
		setRead,
		markAllAsRead,
		refresh: loadNotifs,
	};
}
