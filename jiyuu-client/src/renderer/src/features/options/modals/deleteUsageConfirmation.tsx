import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useStore } from "../../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../../blockings/blockingAPI";
import toast from "react-hot-toast";

export function DeleteUsageConfirmation(): React.JSX.Element {
	const { setConfirmDeleteModal, confirmDeleteModal } = useStore();

	const handleClose = (): void => {
		setConfirmDeleteModal(false);
	};

	const handleSubmit = (): void => {
		ipcRendererSend("usagedata/delete", {});
	};

	React.useEffect(() => {
		const listeners = [
			{
				channel: "usagedata/delete/response",
				handler: (_: unknown, data: { error?: unknown }) => {
					if (data.error) {
						toast.error("Failed to delete analytics records");
					} else {
						setConfirmDeleteModal(false);
						toast.success("Usage data permanently purged");
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
	}, [setConfirmDeleteModal]);

	return (
		<Dialog
			open={confirmDeleteModal}
			onClose={handleClose}
			aria-labelledby="purge-dialog-title"
			aria-describedby="purge-dialog-description"
			PaperProps={{
				sx: {
					borderRadius: 1.5,
					maxWidth: 420,
					p: 0.5,
				},
			}}
		>
			<DialogTitle id="purge-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
				Purge Analytics Data?
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					id="purge-dialog-description"
					sx={{ fontSize: "0.875rem" }}
				>
					This will permanently erase all tracked browsing history, time
					metrics, and destination statistics from the local database. Your
					dashboard will reset to zero. This action cannot be undone.
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
				<Button onClick={handleClose} variant="outlined" size="small" autoFocus>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="error"
					size="small"
				>
					Delete Permanently
				</Button>
			</DialogActions>
		</Dialog>
	);
}
