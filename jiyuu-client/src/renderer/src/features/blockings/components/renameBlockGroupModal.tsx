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
	return (
		<>
			<Modal
				open={isRenameGroupModalOpen}
				onClose={() => setIsRenameGroupModalOpen(false)}
			>
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
								// TODO
								ipcRendererSend("blockgroup/rename", {
									group_id: selectedBlockGroup,
									new_group_name: RenameGroupModalInput,
									old_group_name: RenameOldGroupName,
								});
								setIsRenameGroupModalOpen(false);
								setRenameGroupModalInput("");
								setSelectedBlockGroup(null);

								ipcRendererSend("blockgroup/get", {});
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => {
								setIsRenameGroupModalOpen(false);
								setRenameGroupModalInput("");
								setSelectedBlockGroup(null);
								setRenameOldGroupName("");
							}}
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
