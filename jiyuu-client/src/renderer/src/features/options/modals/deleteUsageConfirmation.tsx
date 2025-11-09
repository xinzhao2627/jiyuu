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
// import toast from "react-hot-toast";

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
				// RECEIVE BLOCK GROUP RESPONSE
				channel: "usagedata/delete/response",
				handler: (_, data) => {
					if (data.error)
						console.error("Error usagedata/delete/response: ", data.error);
					else {
						setConfirmDeleteModal(false);
						toast.success("Successfully deleted");
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

	return (
		<React.Fragment>
			<Dialog
				open={confirmDeleteModal}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">{"Delete usage data"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Delete all records such as{" "}
						{
							'"total time spent", "most used sites", "block group time usage", and "sites visited".'
						}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSubmit} color="error">
						Delete
					</Button>
					<Button onClick={handleClose} autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
