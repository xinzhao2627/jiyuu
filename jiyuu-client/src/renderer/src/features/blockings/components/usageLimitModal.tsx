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
} from "@mui/material";
import * as React from "react";
import { menuButtonStyle, useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
	modalStyle,
	modalTextFieldStyle,
} from "@renderer/assets/shared/modalStyle";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
export default function UsageLimitModal(): React.JSX.Element {
	const {
		isUsageLimitModalOpen,
		setUsageLimitModalOpen,
		setSelectedBlockGroup,
		setUsageResetPeriod,

		setUsageTimeValueNumber,
		usageResetPeriod,
		usageTimeValueNumber,
	} = useStore();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm();
	const handleClose = (): void => {
		setSelectedBlockGroup(null);
		setUsageResetPeriod(null);

		setUsageTimeValueNumber(null);
		setUsageLimitModalOpen(false);
	};
	return (
		<>
			<Dialog
				open={isUsageLimitModalOpen}
				disableEscapeKeyDown
				onClose={handleClose}
			>
				<DialogTitle sx={{ fontFamily: "roboto" }}>
					Add usage limit for this blockgroup
				</DialogTitle>
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
							console.log("submitted");
						} else {
							toast.error("Error submitting usage limit");
							console.log(val);
							console.log(["minutes", "hours"].includes(mode));
							console.log(["d", "w", "h"].includes(period));
						}
					})}
					style={{ display: "flex", flexWrap: "wrap", width: "fit-content" }}
				>
					<DialogContent>
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
							<Button onClick={handleClose}>Cancel</Button>
						</DialogActions>
					</DialogContent>
				</form>
			</Dialog>
		</>
	);
}
