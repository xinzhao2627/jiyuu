/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Modal, Typography, Button, Stack } from "@mui/material";
import * as React from "react";
import { menuButtonStyle, useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import { modalStyle } from "@renderer/assets/shared/modalStyle";

export default function DeleteBlockGroupModal(): React.JSX.Element {
	const {
		isDeleteGroupModalOpen,
		setIsDeleteGroupModalOpen,
		setSelectedBlockGroup,
		selectedBlockGroup,
	} = useStore();
	return (
		<>
			<Modal
				open={isDeleteGroupModalOpen}
				onClose={() => setIsDeleteGroupModalOpen(false)}
			>
				<Box sx={modalStyle}>
					<Typography
						variant="h5"
						color="initial"
						sx={{ ...menuButtonStyle, fontSize: "1.4em", width: "100%" }}
					>
						Are you sure you want to delete this group
					</Typography>
					<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={3}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								if (selectedBlockGroup?.id) {
									// send the id that is about to be deleted in the server
									ipcRendererSend("blockgroup/delete", {
										id: selectedBlockGroup?.id,
									});
								}
								setIsDeleteGroupModalOpen(false);
								setSelectedBlockGroup(null);
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Delete
						</Button>
						<Button
							variant="text"
							color="primary"
							onClick={() => {
								setIsDeleteGroupModalOpen(false);
								setSelectedBlockGroup(null);
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
