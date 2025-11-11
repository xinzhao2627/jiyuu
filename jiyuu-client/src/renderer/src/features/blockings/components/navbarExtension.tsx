import { Stack, Typography, Alert, Chip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { JSX, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ipcRendererOn, ipcRendererSend } from "../blockingAPI";

export function NavbarExtension(): JSX.Element {
	const [urlList, setUrlList] = useState<{ process: string; url: string }[]>(
		[],
	);
	useEffect(() => {
		const listeners = [
			{
				channel: "openurl/response",
				handler: (_, data) => {
					if (data.error) {
						toast.error("Error opening url");
						console.log(data.error);
					}
				},
			},
			{
				channel: "extensionwarning/response",
				handler: (_, data) => {
					if (data.error) {
						console.log(data.error);
					} else if (data.data) {
						setUrlList(data.data);
					}
				},
			},
		];

		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	if (!urlList || urlList.length === 0) return <></>;
	return (
		<Alert
			severity="warning"
			icon={<WarningAmberIcon fontSize="medium" />}
			sx={{
				bgcolor: "transparent",
				mx: 1,
				mt: 1,
				borderRadius: 2,
				backgroundColor: "warning.lighter",
				border: "1px solid",
				borderColor: "warning.light",
				"& .MuiAlert-icon": {
					color: "warning.main",
				},
			}}
		>
			<Stack
				spacing={1.5}
				direction={"row"}
				alignContent={"center"}
				alignItems={"center"}
			>
				<Typography variant="caption" fontWeight={600}>
					Extension not detected/installed in the following browsers:
				</Typography>
				<Stack direction="row" gap={1} flexWrap="wrap">
					{urlList.map((v, i) => (
						<Chip
							key={v.process + " " + i}
							label={v.process}
							style={{ padding: 4, fontWeight: 400 }}
							onClick={() => {
								ipcRendererSend("openurl", { url: v.url, process: v.process });
								console.log("clicked");
							}}
							onDelete={() => {
								// ipcRendererSend("openurl", { url: v.url });
							}}
							deleteIcon={<OpenInNewIcon fontSize="small" />}
							color="warning"
							variant="outlined"
							size="small"
						/>
					))}
				</Stack>
			</Stack>
		</Alert>
	);
}
