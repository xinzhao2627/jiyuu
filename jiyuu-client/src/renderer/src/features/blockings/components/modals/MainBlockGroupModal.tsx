/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Box,
	Modal,
	Typography,
	Button,
	Stack,
	TextField,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
} from "@mui/material";
import * as React from "react";
import { menuButtonStyle, useStore } from "../../blockingsStore";
import { ipcRendererSend } from "../../blockingAPI";
import { modalStyle } from "@renderer/assets/shared/modalStyle";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
const formContainerStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	minWidth: 360,
};

function NewBlockGroupModal(): React.JSX.Element {
	const { register, handleSubmit, reset } = useForm();
	const { setBlockGroupModal, setSelectedBlockGroup } = useStore();
	const handleClose = (): void => {
		setBlockGroupModal("add", false);
		setSelectedBlockGroup(null);
		reset();
	};
	return (
		<>
			<form
				noValidate
				onSubmit={handleSubmit((fv: FieldValues) => {
					if (!fv.newGroupName) {
						toast.error("Invalid group name");
						return;
					}
					const s = fv.newGroupName as string;
					if (s.length < 3) {
						toast.error("group name must be atleast 4 characters!");
						return;
					}
					ipcRendererSend("blockgroup/put", {
						group_name: s,
					});
					handleClose();
				})}
				style={formContainerStyle}
			>
				<DialogContent>
					<TextField
						variant="standard"
						fullWidth
						{...register("newGroupName")}
					/>
				</DialogContent>
				<DialogActions>
					<Stack direction={"row"} justifyContent={"end"} gap={1}>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="text"
							onClick={handleClose}
							sx={{
								...menuButtonStyle,
								fontWeight: 400,
							}}
						>
							Cancel
						</Button>
					</Stack>
				</DialogActions>
			</form>
		</>
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
		<>
			<form
				noValidate
				onSubmit={handleSubmit((fv: FieldValues) => {
					if (!fv.newGroupName) {
						toast.error("Invalid group name");
						return;
					}
					const s = fv.newGroupName as string;
					if (s.length < 3) {
						toast.error("group name must be atleast 4 characters!");
						return;
					}
					if (s === blockGroup.selectedBlockGroup?.group_name) {
						toast.error("The group name cannot be same as the ");
						return;
					}

					ipcRendererSend("blockgroup/set", {
						group: blockGroup.selectedBlockGroup,
						new_group_name: s,
					});
					handleClose();
				})}
				style={{
					display: "flex",
					flexWrap: "wrap",
					width: "fit-content",
				}}
			>
				<DialogContent>
					<TextField
						variant="standard"
						fullWidth
						sx={{ marginTop: 3 }}
						{...register("newGroupName")}
					/>
				</DialogContent>
				<DialogActions>
					<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={3}>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="text"
							onClick={handleClose}
							sx={{
								...menuButtonStyle,
								fontWeight: 400,
							}}
						>
							Cancel
						</Button>
					</Stack>
				</DialogActions>
			</form>
		</>
	);
}
function DeleteBlockGroupModal(): React.JSX.Element {
	const { blockGroup, setBlockGroupModal, setSelectedBlockGroup } = useStore();
	const handleClose = (): void => {
		setBlockGroupModal("delete", false);
		setSelectedBlockGroup(null);
	};
	return (
		<DialogActions>
			<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={3}>
				<Button
					variant="contained"
					color="primary"
					onClick={() => {
						if (blockGroup.selectedBlockGroup?.id) {
							// send the id that is about to be deleted in the server
							ipcRendererSend("blockgroup/delete", {
								id: blockGroup.selectedBlockGroup?.id,
							});
						}
						handleClose();
					}}
					sx={{ ...menuButtonStyle }}
				>
					Delete
				</Button>
				<Button
					variant="text"
					color="primary"
					onClick={handleClose}
					sx={{ ...menuButtonStyle }}
				>
					Cancel
				</Button>
			</Stack>
		</DialogActions>
	);
}

export default function MainBlockGroupModal(): React.JSX.Element {
	const { setBlockGroupModal, setSelectedBlockGroup, blockGroup } = useStore();
	return (
		<>
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
			>
				<DialogTitle>
					<Typography
						component={"span"}
						variant="h5"
						color="initial"
						sx={{ ...menuButtonStyle, fontSize: "1.4em", width: "100%" }}
					>
						{blockGroup.modal.delete &&
							"Are you sure you want to delete this group"}
						{blockGroup.modal.add && "Enter group name"}
						{blockGroup.modal.rename && "Enter new group name"}
					</Typography>
				</DialogTitle>
				{blockGroup.modal.add && <NewBlockGroupModal />}
				{blockGroup.modal.delete && <DeleteBlockGroupModal />}
				{blockGroup.modal.rename && <RenameBlockGroupModal />}
			</Dialog>
		</>
	);
}
