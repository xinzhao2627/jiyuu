import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Whitelist(): React.JSX.Element {
	const [whitelistData, setWhitelistData] = useState<string[]>([]);
	useEffect(() => {
		const listeners = [
			{
				channel: "whitelist/put/response",
				handler: (_, data: { error: string; data: string[] }) => {
					if (data.error) {
						toast.error("error adding a whitelist");
						console.log(data.error);
					} else {
						setWhitelistData(data.data);
					}
				},
			},
			{
				channel: "whitelist/get/response",
				handler: (_, data: { error: string; data: string[] }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					} else {
						setWhitelistData(data.data);
					}
				},
			},
			{
				channel: "whitelist/delete/response",
				handler: (_, data: { error: string; data: string[] }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					} else {
						setWhitelistData(data.data);
					}
				},
			},
		];

		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	return <>{whitelistData}</>;
}
