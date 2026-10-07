import {
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
	DialogContentText,
} from "@mui/material";
import * as React from "react";
import { useStore } from "../../blockingsStore";
import { ipcRendererSend } from "../../blockingAPI";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";

function NewBlockGroupModal(): React.JSX.Element {
	const { register, handleSubmit, reset } = useForm();
	const { setBlockGroupModal, setSelectedBlockGroup } = useStore();

	const handleClose = (): void => {
		setBlockGroupModal("add", false);
		setSelectedBlockGroup(null);
		reset();
	};

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv: FieldValues) => {
				const s = (fv.newGroupName as string)?.trim();
				if (!s || s.length < 3) {
					toast.error("Group name must be at least 3 characters");
					return;
				}
				ipcRendererSend("blockgroup/put", { group_name: s });
				handleClose();
			})}
		>
			<DialogContent sx={{ pt: 1, pb: 2 }}>
				<TextField
					size="small"
					label="Group Name"
					placeholder="e.g. Social Media, Gaming"
					variant="outlined"
					autoFocus
					fullWidth
					{...register("newGroupName")}
				/>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
				<Button variant="outlined" size="small" onClick={handleClose}>
					Cancel
				</Button>
				<Button variant="contained" color="primary" size="small" type="submit">
					Create Group
				</Button>
			</DialogActions>
		</form>
	);
}

function RenameBlockGroupModal(): React.JSX.Element {
	const { register, handleSubmit, reset } = useForm();
	const { setBlockGroupModal, setSelectedBlockGroup, blockGroup } = useStore();

	const handleClose = (): void => {
		setBlockGroupModal("rename", false);
		setSelectedBlockGroup(null);
		reset();
	};

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv: FieldValues) => {
				const s = (fv.newGroupName as string)?.trim();
				if (!s || s.length < 3) {
					toast.error("Group name must be at least 3 characters");
					return;
				}
				if (s === blockGroup.selectedBlockGroup?.group_name) {
					toast.error("Group name is identical to current name");
					return;
				}

				ipcRendererSend("blockgroup/set", {
					group: blockGroup.selectedBlockGroup,
					new_group_name: s,
				});
				handleClose();
			})}
		>
			<DialogContent sx={{ pt: 1, pb: 2 }}>
				<TextField
					size="small"
					label="New Group Name"
					defaultValue={blockGroup.selectedBlockGroup?.group_name || ""}
					variant="outlined"
					autoFocus
					fullWidth
					{...register("newGroupName")}
				/>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
				<Button variant="outlined" size="small" onClick={handleClose}>
					Cancel
				</Button>
				<Button variant="contained" color="primary" size="small" type="submit">
					Rename
				</Button>
			</DialogActions>
		</form>
	);
}

function DeleteBlockGroupModal(): React.JSX.Element {
	const { blockGroup, setBlockGroupModal, setSelectedBlockGroup } = useStore();

	const handleClose = (): void => {
		setBlockGroupModal("delete", false);
		setSelectedBlockGroup(null);
	};

	return (
		<>
			<DialogContent sx={{ pt: 0, pb: 2 }}>
				<DialogContentText sx={{ fontSize: "0.875rem" }}>
					Are you sure you want to delete{" "}
					<strong>{blockGroup.selectedBlockGroup?.group_name}</strong>? All
					associated blocking rules and settings in this group will be
					permanently removed.
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
				<Button variant="outlined" size="small" onClick={handleClose}>
					Cancel
				</Button>
				<Button
					variant="contained"
					color="error"
					size="small"
					onClick={() => {
						if (blockGroup.selectedBlockGroup?.id) {
							ipcRendererSend("blockgroup/delete", {
								id: blockGroup.selectedBlockGroup.id,
							});
						}
						handleClose();
					}}
				>
					Delete Group
				</Button>
			</DialogActions>
		</>
	);
}

export default function MainBlockGroupModal(): React.JSX.Element {
	const { setBlockGroupModal, setSelectedBlockGroup, blockGroup } = useStore();

	return (
		<Dialog
			open={
				blockGroup.modal.add ||
				blockGroup.modal.rename ||
				blockGroup.modal.delete
			}
			onClose={() => {
				setBlockGroupModal("add", false);
				setBlockGroupModal("delete", false);
				setBlockGroupModal("rename", false);
				setSelectedBlockGroup(null);
			}}
			PaperProps={{
				sx: {
					borderRadius: 1.5,
					maxWidth: 440,
					minWidth: { xs: "calc(100vw - 32px)", sm: 400 },
					p: 0.5,
				},
			}}
		>
			<DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
				{blockGroup.modal.delete && "Delete Block Group?"}
				{blockGroup.modal.add && "Add Block Group"}
				{blockGroup.modal.rename && "Rename Block Group"}
			</DialogTitle>
			{blockGroup.modal.add && <NewBlockGroupModal />}
			{blockGroup.modal.delete && <DeleteBlockGroupModal />}
			{blockGroup.modal.rename && <RenameBlockGroupModal />}
		</Dialog>
	);
}
