import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	Typography,
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import toast from "react-hot-toast";
import {
	ipcRendererOn,
	ipcRendererSend,
} from "@renderer/features/blockings/blockingAPI";

export function BotbarTutorial(): JSX.Element {
	const [isTutOpen, setIsTutOpen] = useState<boolean>(false);
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
		];
		const val = localStorage.getItem("isTutOpen") === "true";
		setIsTutOpen(val);
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	if (!isTutOpen) return <></>;

	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			sx={{
				backgroundColor: "primary.dark",
				color: "primary.contrastText",
				px: 2,
				py: 1,
				alignItems: "center",
				justifyContent: "space-between",
				gap: 1,
			}}
		>
			<Typography sx={{ fontSize: 15, p: 0 }}>
				New to Jiyuu? Head to the tutorial.
			</Typography>
			<Stack direction="row" gap={1.5} justifyContent="end">
				<Button
					variant="text"
					size="small"
					sx={{
						fontSize: 12,
						px: 1.25,
						py: 0.5,
						color: "primary.contrastText",
					}}
					onClick={() => {
						localStorage.removeItem("isTutOpen");
						setIsTutOpen(false);
					}}
				>
					Close & don&apos;t show again
				</Button>
				<Button
					variant="contained"
					size="small"
					sx={{
						fontSize: 12,
						px: 1.25,
						py: 0.5,
						backgroundColor: "background.paper",
						color: "primary.dark",
						"&:hover": { backgroundColor: "background.paper" },
					}}
					endIcon={<OpenInNewIcon fontSize="small" />}
					onClick={() => {
						ipcRendererSend("openurl", { process: "default" });
					}}
				>
					Go to website
				</Button>
			</Stack>
		</Stack>
	);
}

export function ExtensionInstallNotice(): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setIsOpen(
			localStorage.getItem("isExtensionInstallNoticeDismissed") !== "true",
		);
	}, []);

	const handleClose = (): void => {
		localStorage.setItem("isExtensionInstallNoticeDismissed", "true");
		setIsOpen(false);
	};

	return (
		<Dialog
			open={isOpen}
			onClose={handleClose}
			aria-labelledby="extension-install-title"
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle id="extension-install-title">
				<Stack direction="row" alignItems="center" gap={1.25}>
					<ExtensionOutlinedIcon color="primary" />
					<Typography variant="h6">Install the Jiyuu extension</Typography>
				</Stack>
			</DialogTitle>
			<DialogContent>
				<Stack spacing={1.5}>
					<Typography variant="body2" color="text.secondary">
						Jiyuu works best when the browser extension is installed in every
						browser you use.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						If a block group is active, Jiyuu may close browsers where the
						extension is missing or where it is not allowed in incognito/private
						windows.
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Got it</Button>
				<Button
					variant="contained"
					endIcon={<OpenInNewIcon fontSize="small" />}
					onClick={() => {
						ipcRendererSend("openurl", { process: "default" });
						handleClose();
					}}
				>
					Open download page
				</Button>
			</DialogActions>
		</Dialog>
	);
}
