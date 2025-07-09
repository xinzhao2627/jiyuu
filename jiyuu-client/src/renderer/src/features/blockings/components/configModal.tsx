/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Box,
	Modal,
	Typography,
	TextField,
	Button,
	Stack,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Card,
	CardContent,
	CardActionArea,
} from "@mui/material";
import * as React from "react";
import { menuButtonStyle, useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import {
	modalStyle,
	modalTextFieldStyle,
} from "@renderer/assets/shared/modalStyle";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
export default function UsageLimitModal(): React.JSX.Element {
	const { isConfigModalOpen, setIsConfigModalOpen, setConfigType, configType } =
		useStore();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm();
	const handleClose = (): void => {};
	const configTypeList = [
		{
			title: "Usage limit",
			type: "usageLimit",
			description:
				"Sets the usage limit of this block group. The block group will immediately activate if usage limit has been reached. Resets after certain period",
		},
		{
			title: "Random Text",
			type: "randomText",
			description:
				"Encrypts the block group with random text. When deactivating the block group, you need to type the the presented text to unlock.",
		},
		{
			title: "Restrict Timer",
			type: "restrictTimer",
			description:
				"Restrict block group modification if there is an active restrict timer.",
		},
	];
	return (
		<>
			<Dialog
				open={isConfigModalOpen}
				disableEscapeKeyDown
				onClose={handleClose}
			>
				<DialogTitle sx={{ fontFamily: "roboto" }}>
					Configure block settings
				</DialogTitle>

				<DialogContent>
					{configType === "" && (
						<Box
							sx={{
								width: "100%",
								display: "grid",
								gridTemplateColumns:
									"repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
								gap: 2,
							}}
						>
							{configTypeList.map((card, i): React.JSX.Element => {
								return (
									<Card key={"config - " + i}>
										<CardActionArea
											sx={{
												height: "100%",
												"&[data-active]": {
													backgroundColor: "action.selected",
													"&:hover": {
														backgroundColor: "action.selectedHover",
													},
												},
											}}
										>
											<CardContent>
												<Typography variant="h5" component="div">
													{card.title}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{card.description}
												</Typography>
											</CardContent>
										</CardActionArea>
									</Card>
								);
							})}
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 0.2, mt: 2 }}>
					<div
						style={{
							width: "100%",
							textAlign: "left",
						}}
					>
						<Button variant="text" color="secondary" sx={{ m: 0, p: 0 }}>
							Disable usage limit
						</Button>
					</div>
					<Button type="submit" sx={{ fontWeight: "600" }}>
						Ok
					</Button>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
