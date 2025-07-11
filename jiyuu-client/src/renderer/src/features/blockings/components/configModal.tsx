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
	scrollbarStyle,
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
				"Restrict the block group with random text. When deactivating the block group, you need to type the presented text to unlock.",
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
			description: "Set up password to restrict access for this blockgroup",
		},
	];
	// TODO: ADD ENDPOINTS FOR ALL configtypoes
	const resetButton = (): React.JSX.Element => {
		return (
			<Button
				color="error"
				variant="outlined"
				onClick={() => {
					if (configType === "password") {
						console.log("verify password");
					}
					ipcRendererSend("blockgroupconfig/delete", {
						id: selectedBlockGroup?.id,
						config_type: configType,
					});
				}}
			>
				Reset
			</Button>
		);
	};
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

				<DialogContent sx={{ overflowY: "auto", ...scrollbarStyle }}>
					{configType === "" && (
						<Box
							sx={{
								width: "100%",
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 2,
							}}
						>
							{configTypeList.map((card, i): React.JSX.Element => {
								return (
									<Card
										key={"config - " + i}
										sx={{
											gridColumn:
												card.type === "usageLimit" ? "1 / -1" : "auto", // Full width for usageLimit
										}}
									>
										<CardActionArea
											onClick={() => {
												ipcRendererSend("blockgroupconfig/get", {
													id: selectedBlockGroup?.id,
													config_type: card.type,
												});
												setConfigType(card.type);
											}}
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
					{configType === "" && (
						<Typography
							variant="overline"
							color="initial"
							sx={{
								width: "100%",
								textAlign: "center",
								// fontStyle: "italic",
								justifyContent: "center",
								display: "flex",
								mt: 2,
								fontWeight: "600",
							}}
						>
							You can add restriction for this block group
						</Typography>
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
										resetPeriod: period,
										allocatedLimit: res,
										config_type: configType,
									};
									ipcRendererSend("blockgroupconfig/set", {
										id: selectedBlockGroup?.id,
										config_data: data,
									});
									toast.success("adding usage successful");
								} else {
									toast.error("Error submitting usage limit");
									console.log(val);
									console.log(["minutes", "hours"].includes(mode));
									console.log(["d", "w", "h"].includes(period));
								}
								handleClose();
							})}
							style={{
								display: "flex",
								flexWrap: "wrap",
								width: "fit-content",
							}}
						>
							<Stack gap={2}>
								<Stack direction={"row"} gap={2}>
									<Box sx={{ ...modalTextFieldStyle }}>
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

								<Box sx={{ ...modalTextFieldStyle }}>
									<Controller
										name="usageResetPeriod"
										defaultValue={usageResetPeriod || "h"}
										control={control}
										render={({ field }) => (
											<Select {...field} fullWidth size="small">
												<MenuItem value={"d"}>Resets daily</MenuItem>
												<MenuItem value={"w"}>Resets weekly</MenuItem>
												<MenuItem value={"h"}>Resets hourly</MenuItem>
											</Select>
										)}
									/>
								</Box>
								<Button
									type="submit"
									variant="contained"
									sx={{ fontWeight: "600" }}
								>
									Submit
								</Button>
								{resetButton()}
							</Stack>
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
