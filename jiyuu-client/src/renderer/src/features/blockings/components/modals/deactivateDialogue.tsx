import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useStore } from "../../blockingsStore";
import { ipcRendererSend } from "../../blockingAPI";
// import toast from "react-hot-toast";

export function GroupDeactivateDialogue(): React.JSX.Element {
	const { blockGroup, setBlockGroupModal, setSelectedBlockGroup } = useStore();

	const handleClose = (): void => {
		setBlockGroupModal("deactivateGroupModal", false);
		setSelectedBlockGroup(null);
	};

	const removeUsageLimit = (): void => {
		ipcRendererSend("blockgroupconfig/delete", {
			id: blockGroup.selectedBlockGroup?.id,
			config_data: { config_type: "usageLimit" },
		});
		handleClose();
		// toast.success("Usage limit removed");
	};

	return (
		<React.Fragment>
			<Dialog
				open={blockGroup.modal.deactivateGroupModal}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Unable to deactivate this group"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						This group has an unpaused usage limit, disable or pause it first to
						deactivate this group
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={removeUsageLimit} color="error">
						Remove usage limit
					</Button>
					<Button onClick={handleClose} autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
