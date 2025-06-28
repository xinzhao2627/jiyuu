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
const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	boxShadow: 24,
	color: "black",
	outline: "none",
	pt: 2,
	px: 4,
	pb: 3,
};
export default function NewBlockGroupModal(): React.JSX.Element {
	const {
		isNewGroupModalOpen,
		setIsNewGroupModalOpen,
		NewGroupModalInput,
		setNewGroupModalInput,
	} = useStore();
	return (
		<>
			<Modal
				open={isNewGroupModalOpen}
				onClose={() => setIsNewGroupModalOpen(false)}
			>
				<Box sx={modalStyle}>
					<Typography
						variant="h5"
						color="initial"
						sx={{ ...menuButtonStyle, fontSize: "1.4em", width: "100%" }}
					>
						Enter group name
					</Typography>
					<TextField
						variant="standard"
						fullWidth
						sx={{ marginTop: 3 }}
						value={NewGroupModalInput}
						onChange={(e) => setNewGroupModalInput(e.target.value)}
					/>
					<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={3}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								// TODO
								// ipcRendererSend("blockgroup/put", {
								// 	group_name: NewGroupModalInput,
								// });
								setIsNewGroupModalOpen(false);
								setNewGroupModalInput("");
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => {
								setIsNewGroupModalOpen(false);
								setNewGroupModalInput("");
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
