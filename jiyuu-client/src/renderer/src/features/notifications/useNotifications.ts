import { useEffect, useState, useCallback } from "react";
import type { Notif } from "../../Notification";

export interface UseNotificationsReturn {
	notifs: Notif[];
	readIds: string[];
	unreadCount: number;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	refresh: () => void;
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
			if (raw) {
				setNotifs(JSON.parse(raw) as Notif[]);
			}
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

	const markAsRead = (id: string): void => {
		const next = Array.from(new Set([...readIds, id]));
		setReadIds(next);
		localStorage.setItem("JIYUU_NOTIFS_READ", JSON.stringify(next));
	};

	const markAllAsRead = (): void => {
		const allIds = notifs.map((n) => n.id);
		setReadIds(allIds);
		localStorage.setItem("JIYUU_NOTIFS_READ", JSON.stringify(allIds));
	};

	const unreadCount = notifs.filter((n) => !readIds.includes(n.id)).length;

	return {
		notifs,
		readIds,
		unreadCount,
		markAsRead,
		markAllAsRead,
		refresh: loadNotifs,
	};
}
