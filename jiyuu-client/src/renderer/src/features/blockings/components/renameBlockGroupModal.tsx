/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Box,
	Modal,
	Typography,
	TextField,
	Button,
	Stack,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";
import { menuButtonStyle, useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import { modalStyle } from "@renderer/assets/shared/modalStyle";
import toast from "react-hot-toast";

export default function RenameBlockGroupModal(): React.JSX.Element {
	const {
		isRenameGroupModalOpen,
		setIsRenameGroupModalOpen,
		RenameGroupModalInput,
		setRenameGroupModalInput,
		setSelectedBlockGroup,
		selectedBlockGroup,
		RenameOldGroupName,
		setRenameOldGroupName,
	} = useStore();
	const handleClose = (): void => {
		setIsRenameGroupModalOpen(false);
		setRenameGroupModalInput("");
		setSelectedBlockGroup(null);
		setRenameOldGroupName("");
	};
	return (
		<>
			<Modal open={isRenameGroupModalOpen} onClose={handleClose}>
				<Box sx={modalStyle}>
					<Typography
						variant="h5"
						color="initial"
						sx={{ ...menuButtonStyle, fontSize: "1.4em", width: "100%" }}
					>
						Enter new group name
					</Typography>
					<TextField
						variant="standard"
						fullWidth
						sx={{ marginTop: 3 }}
						value={RenameGroupModalInput}
						onChange={(e) => setRenameGroupModalInput(e.target.value)}
					/>
					<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={3}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								if (RenameGroupModalInput === selectedBlockGroup?.group_name) {
									toast.error("group name already exist");
								} else {
									ipcRendererSend("blockgroup/set", {
										group: selectedBlockGroup,
										new_group_name: RenameGroupModalInput,
									});

									handleClose();
								}
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={handleClose}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Cancel
						</Button>
					</Stack>
				</Box>
			</Modal>
		</>
	);
}
