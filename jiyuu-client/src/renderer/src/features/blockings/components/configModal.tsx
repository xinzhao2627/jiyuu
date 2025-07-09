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
export default function ConfigModal(): React.JSX.Element {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm();
	const {
		isConfigModalOpen,
		setIsConfigModalOpen,
		setConfigType,
		configType,
		selectedBlockGroup,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setUsageLimitModalOpen,
		usageTimeValueNumber,
		usageResetPeriod,
	} = useStore();

	const handleClose = (): void => {
		setIsConfigModalOpen(false);
		setSelectedBlockGroup(null);
		setUsageResetPeriod(null);

		setUsageTimeValueNumber(null);
		setUsageLimitModalOpen(false);
		setTimeout(() => {
			setConfigType("");
		}, 150);
	};
	const configTypeList = [
		{
			title: "Usage limit",
			type: "usageLimit",
			description:
				"Sets the usage limit of this block group. The block group will immediately activate if usage limit has been reached. Resets remaining time after certain period",
		},
		{
			title: "Random Text",
			type: "randomText",
			description:
				"Encrypts the block group with random text. When deactivating the block group, you need to type the presented text to unlock.",
		},
		{
			title: "Restrict Timer",
			type: "restrictTimer",
			description:
				"Restrict/lock block group modification if there is an active restrict timer.",
		},
		{
			title: "Password",
			type: "password",
			description: "Set up password to modify this blockgroup",
		},
	];
	return (
		<>
			<Dialog
				open={isConfigModalOpen}
				onClose={handleClose}
				disableEscapeKeyDown
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
											onClick={() => setConfigType(card.type)}
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
											<CardContent sx={{ height: "100%" }}>
												<Typography variant="h5" component="div">
													{card.title}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													mt={1}
													sx={{ height: "100" }}
												>
													{card.description}
												</Typography>
											</CardContent>
										</CardActionArea>
									</Card>
								);
							})}
						</Box>
					)}
					{configType === "usageLimit" && (
						<form
							noValidate
							onSubmit={handleSubmit((fv) => {
								const val = Number(fv.usageValue);
								const mode = fv.timeValueMode;
								const period = fv.usageResetPeriod;

								if (
									!Number.isNaN(val) &&
									["minutes", "hours"].includes(mode) &&
									["d", "w", "h"].includes(period)
								) {
									const res = val * (mode == "minutes" ? 60 : 60 * 60);
									const data = {
										block_group_id: selectedBlockGroup?.id,
										config_type: configType,
										config_data: {
											resetPeriod: period,
											allocatedLimit: res,
										},
									};
								} else {
									toast.error("Error submitting usage limit");
									console.log(val);
									console.log(["minutes", "hours"].includes(mode));
									console.log(["d", "w", "h"].includes(period));
								}
							})}
							style={{
								display: "flex",
								flexWrap: "wrap",
								width: "fit-content",
							}}
						>
							<Stack gap={2}>
								<Stack direction={"row"} gap={2}>
									<Box sx={modalTextFieldStyle}>
										<input
											type="number"
											id="usageValue"
											placeholder="Enter value"
											{...register("usageValue")}
											defaultValue={usageTimeValueNumber}
										/>
									</Box>
									<Box sx={{ ...modalTextFieldStyle }}>
										<Controller
											name="timeValueMode"
											control={control}
											defaultValue={"minutes"}
											render={({ field }) => (
												<Select {...field} size="small" fullWidth>
													<MenuItem value={"minutes"}>minute</MenuItem>
													<MenuItem value={"hours"}>hour</MenuItem>
												</Select>
											)}
										/>
									</Box>
								</Stack>

								<Box sx={modalTextFieldStyle}>
									<Controller
										name="usageResetPeriod"
										defaultValue={usageResetPeriod || "h"}
										control={control}
										render={({ field }) => (
											<Select {...field} size="small">
												<MenuItem value={"d"}>Resets daily</MenuItem>
												<MenuItem value={"w"}>Resets weekly</MenuItem>
												<MenuItem value={"h"}>Resets hourly</MenuItem>
											</Select>
										)}
									/>
								</Box>
							</Stack>
							<Button type="submit" sx={{ fontWeight: "600" }}>
								Submit
							</Button>
						</form>
					)}
				</DialogContent>
				<DialogActions sx={{ mt: 2 }}>
					{configType !== "" && (
						<Button onClick={() => setConfigType("")}>Go back</Button>
					)}
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
