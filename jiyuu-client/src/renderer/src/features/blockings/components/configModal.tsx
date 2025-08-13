import {
	Box,
	Typography,
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
import "react-datepicker/dist/react-datepicker.css";
import * as React from "react";
import { useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import {
	modalTextFieldStyle,
	scrollbarStyle,
} from "@renderer/assets/shared/modalStyle";
import { Controller, FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
	LocalizationProvider,
	MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { blue } from "@mui/material/colors";
import { isBefore } from "date-fns";
export default function ConfigModal(): React.JSX.Element {
	const [randomTextContent, setRandomTextContent] = React.useState<string>("");
	const { register, handleSubmit, control, reset } = useForm();
	const {
		config,
		blockGroup,
		setIsConfigModalOpen,
		setConfigType,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
	} = useStore();

	const handleClose = (): void => {
		setIsConfigModalOpen(false);
		setConfigType(null);
		setSelectedBlockGroup(null);
		setUsageResetPeriod(null);
		setUsageTimeValueNumber(null);
		setRandomTextContent("");

		reset();
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
				"Use this to restrict a block group, disabling you from modifying until it reaches the specified date.",
		},
		{
			title: "Password",
			type: "password",
			description: "Set up password to restrict access for this blockgroup",
		},
	];
	// reset button for usage limit
	const resetButton = (): React.JSX.Element => {
		return (
			<Button
				color="error"
				variant="outlined"
				disabled={Boolean(blockGroup.selectedBlockGroup?.restriction_type)}
				onClick={() => {
					quickUnlock({ config_type: "usageLimit" });
				}}
			>
				Remove usage limit
			</Button>
		);
	};
	const quickSendForms = (data): void => {
		ipcRendererSend("blockgroupconfig/set", {
			id: blockGroup.selectedBlockGroup?.id,
			config_data: data,
		});
	};
	const quickUnlock = (data): void => {
		ipcRendererSend("blockgroupconfig/delete", {
			id: blockGroup.selectedBlockGroup?.id,
			config_data: data,
		});
	};
	const usageSubmit = (fv: FieldValues): void => {
		try {
			const val = Number(fv.usageValue);
			const mode = fv.timeValueMode;
			const period = fv.usageResetPeriod;
			// check if input is valid
			if (
				!(
					!Number.isNaN(val) &&
					["minute", "hour"].includes(mode) &&
					["d", "w", "h"].includes(period)
				)
			) {
				toast.error("Invalid input");
				throw `Error ${{ val: val, mode: mode, period: period }}`;
			}
			// also check if the time value does exceed the reset period they chose
			const rawVal =
				mode === "minute" ? val * 60 : mode === "hour" ? val * 60 * 60 : val;
			if (
				(period === "d" && rawVal > 86400) ||
				(period === "w" && rawVal > 604800) ||
				(period === "h" && rawVal > 3600)
			) {
				toast.error("Invalid time value");
				throw `Error, time value exceeds the chosen period: ${{ period: period, val_second: rawVal, mode: mode }}`;
			}
			const data = {
				usage_reset_type: period,
				usage_reset_value: val,
				usage_reset_value_mode: mode,
				config_type: config.type,
			};
			quickSendForms(data);
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}

		handleClose();
	};
	const passwordSubmit = (fv: FieldValues): void => {
		try {
			const password = fv.password;
			if (!password) throw "The input field is empty";
			quickSendForms({ password: password, config_type: "password" });
			handleClose();
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}
	};
	const passwordUnlock = (fv: FieldValues): void => {
		try {
			let isSuccess = false;
			const password = fv.password;
			const cj = JSON.parse(
				`[${blockGroup.selectedBlockGroup?.configs_json}]`,
			) as {
				config_type: string;
				config_data: string;
			}[];
			for (const c of cj) {
				const cd = JSON.parse(c.config_data) as
					| UsageLimitData_Config
					| Password_Config
					| RestrictTimer_Config
					| RandomText_Config;
				if (cd.config_type === "password" && cd.password === password) {
					// delete the config to unlock
					quickUnlock({ config_type: cd.config_type });
					isSuccess = true;
				}
			}
			if (isSuccess) {
				// toast.success("Restriction unlocked");
				handleClose();
			} else {
				throw "Password incorrect";
			}
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}
	};
	const randomTextUnlock = (fv: FieldValues): void => {
		try {
			const rtcontent = fv.randomTextContent;
			// if one of the input or content is empty, throw an error
			if (!(rtcontent && randomTextContent))
				throw "Invalid input or invalid random generated characters";
			if (rtcontent === randomTextContent) {
				quickUnlock({ config_type: "randomText" });
				handleClose();
			} else throw "Invalid text input";
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}
	};
	const randomTextSubmit = (fv: FieldValues): void => {
		try {
			const randomTextCount = Number(fv.randomTextCount);
			if (!randomTextCount || Number.isNaN(randomTextCount))
				throw "Invalid character count";
			if (randomTextCount > 999) {
				throw "Must be at most 3 digits only";
			}
			quickSendForms({
				randomTextCount: randomTextCount,
				config_type: "randomText",
			});
			handleClose();
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}
	};
	const restrictTimerSubmit = (fv: FieldValues): void => {
		try {
			const d = new Date(fv.restrictTimer);
			const currentDate = new Date();
			if (!fv.restrictTimer || isNaN(d.getTime())) throw "Invalid date";
			if (isBefore(d, currentDate)) throw "Past dates are not allowed";
			quickSendForms({
				end_date: d,
				config_type: "restrictTimer",
			});
			handleClose();
		} catch (error) {
			console.log(error);
			toast.error(error instanceof Error ? error.message : String(error));
		}
	};
	const baseLabel = (): string => {
		let res = "You can add restriction for this block group";

		if (blockGroup.selectedBlockGroup?.restriction_type === "password") {
			res = "This block group is locked through password";
		} else if (
			blockGroup.selectedBlockGroup?.restriction_type === "restrictTimer"
		) {
			if (blockGroup.selectedBlockGroup.configs_json) {
				const cj = JSON.parse(
					`[${blockGroup.selectedBlockGroup.configs_json}]`,
				) as {
					config_type: string;
					config_data: string;
				}[];
				for (const c of cj) {
					const cd = JSON.parse(c.config_data) as
						| UsageLimitData_Config
						| Password_Config
						| RestrictTimer_Config
						| RandomText_Config;
					if (cd.config_type === "restrictTimer") {
						res =
							"This block group is locked until: " +
							new Date(cd.end_date).toLocaleString("en-US", {
								weekday: "short",
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								hour12: true,
							});
					}
				}
			}
		} else if (
			blockGroup.selectedBlockGroup?.restriction_type === "randomText"
		) {
			res = "This block group is locked through random text";
		}
		return res;
	};
	const generateRandomChar = (length: number): void => {
		let res = "";
		const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < length; i++) {
			const randomInd = Math.floor(Math.random() * characters.length);
			res += characters.charAt(randomInd);
		}
		setRandomTextContent(res);
	};
	// shows the hour or not depending if there is analready existing resitrction
	const hourShower = (): React.JSX.Element | undefined => {
		let component: React.JSX.Element | undefined = (
			<MenuItem value={"hour"}>hour</MenuItem>
		);
		if (blockGroup.selectedBlockGroup?.configs_json) {
			const cj = JSON.parse(
				`[${blockGroup.selectedBlockGroup?.configs_json}]`,
			) as {
				config_type: string;
				config_data: string;
			}[];
			for (const c of cj) {
				const cd = JSON.parse(c.config_data) as
					| UsageLimitData_Config
					| Password_Config
					| RestrictTimer_Config
					| RandomText_Config;
				if (
					Boolean(blockGroup.selectedBlockGroup?.restriction_type) &&
					cd.config_type === "usageLimit" &&
					cd.usage_reset_value_mode === "minute"
				) {
					component = undefined;
				}
			}
		}

		return component;
	};
	return (
		<>
			<Dialog
				open={config.modal}
				onClose={handleClose}
				disableEscapeKeyDown
				transitionDuration={0}
				sx={{
					"& .MuiDialog-paper": {
						minHeight: "400px",
						overflow: "hidden",
					},
				}}
				disablePortal={false}
			>
				<DialogTitle sx={{ fontFamily: "roboto" }}>
					Configure block settings
				</DialogTitle>

				<DialogContent sx={{ overflowY: "auto", ...scrollbarStyle }}>
					{!config.type && (
						<Box
							sx={{
								width: "100%",
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 2,
							}}
						>
							{configTypeList.map((card, i): React.JSX.Element => {
								const cardType = card.type as ConfigType;
								return (
									<Card
										key={"config - " + i}
										sx={{
											gridColumn:
												card.type === "usageLimit" ? "1 / -1" : "auto", // Full width for usageLimit
										}}
									>
										<CardActionArea
											disabled={
												cardType !== "usageLimit"
													? cardType === "restrictTimer" &&
														Boolean(
															blockGroup.selectedBlockGroup?.restriction_type,
														)
														? true
														: Boolean(
																blockGroup.selectedBlockGroup?.restriction_type,
															) &&
															blockGroup.selectedBlockGroup
																?.restriction_type !== cardType
													: false
											}
											onClick={() => {
												// console.log(selectedBlockGroup, card.type);
												if (cardType === "randomText") {
													const cj = JSON.parse(
														`[${blockGroup.selectedBlockGroup?.configs_json}]`,
													) as {
														config_type: string;
														config_data: string;
													}[];
													for (const c of cj) {
														const cd = JSON.parse(c.config_data) as
															| UsageLimitData_Config
															| Password_Config
															| RestrictTimer_Config
															| RandomText_Config;
														if (
															cd.config_type === "randomText" &&
															!Number.isNaN(Number(cd.randomTextCount))
														) {
															generateRandomChar(cd.randomTextCount);
														}
													}
												}
												setConfigType(cardType);
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
												<Typography variant="h6" component="div">
													{card.title}
												</Typography>
												{/* {selectedBlockGroup?.restriction_type} */}
												{(blockGroup.selectedBlockGroup?.restriction_type ===
													card.type ||
													(blockGroup.selectedBlockGroup?.usage_label &&
														card.type === "usageLimit")) && (
													<Typography
														variant="subtitle2"
														sx={{ color: blue[900], fontWeight: "600" }}
													>
														{"(Active)"}
													</Typography>
												)}

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
					{config.type === null && (
						<Typography
							variant="overline"
							color="initial"
							sx={{
								width: "100%",
								textAlign: "center",
								justifyContent: "center",
								display: "flex",
								mt: 2,
								fontWeight: "600",
							}}
						>
							{baseLabel()}
						</Typography>
					)}
					{config.type === "usageLimit" && (
						<form
							noValidate
							onSubmit={handleSubmit(usageSubmit)}
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
											{...(blockGroup.selectedBlockGroup?.restriction_type && {
												max: config.usage.timeValueNumber?.val,
											})}
											id="usageValue"
											placeholder="Enter value"
											{...register("usageValue")}
											defaultValue={
												config.usage.timeValueNumber
													? config.usage.timeValueNumber.val
													: undefined
											}
										/>
									</Box>
									<Box sx={{ ...modalTextFieldStyle }}>
										<Controller
											name="timeValueMode"
											control={control}
											defaultValue={
												config.usage.timeValueNumber
													? config.usage.timeValueNumber.mode
													: "minute"
											}
											render={({ field }) => (
												<Select {...field} size="small" fullWidth>
													<MenuItem value={"minute"}>minute</MenuItem>
													{hourShower()}
												</Select>
											)}
										/>
									</Box>
								</Stack>

								<Box sx={{ ...modalTextFieldStyle }}>
									<Controller
										name="usageResetPeriod"
										defaultValue={config.usage.resetPeriod || "h"}
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
								{/* reset or remove the usage limit */}
								{resetButton()}
							</Stack>
						</form>
					)}
					{config.type === "password" && (
						<form
							noValidate
							style={{
								display: "flex",
								flexWrap: "wrap",
								width: "100%",
							}}
							onSubmit={handleSubmit(
								blockGroup.selectedBlockGroup?.restriction_type &&
									blockGroup.selectedBlockGroup.restriction_type === "password"
									? passwordUnlock
									: passwordSubmit,
							)}
						>
							<Stack gap={2} width={"100%"}>
								<Box sx={{ ...modalTextFieldStyle, width: "100%" }}>
									<input
										style={{ width: "100%" }}
										type="text"
										id="password"
										placeholder={
											blockGroup.selectedBlockGroup?.restriction_type &&
											blockGroup.selectedBlockGroup.restriction_type ===
												"password"
												? "Enter your password"
												: "Enter a new password"
										}
										{...register("password")}
									/>
									<Typography variant="caption" color="initial">
										{blockGroup.selectedBlockGroup?.restriction_type &&
										blockGroup.selectedBlockGroup.restriction_type ===
											"password"
											? "Enter your password to remove restriction"
											: "Enter a new password"}
									</Typography>
								</Box>
								<Button
									type="submit"
									variant="contained"
									sx={{ fontWeight: "600" }}
								>
									Submit
								</Button>
							</Stack>
						</form>
					)}
					{config.type === "randomText" &&
						(blockGroup.selectedBlockGroup?.restriction_type &&
						blockGroup.selectedBlockGroup.restriction_type === "randomText" ? (
							<form
								noValidate
								style={{
									display: "flex",
									flexWrap: "wrap",
									width: "fit-content",
								}}
								onSubmit={handleSubmit(randomTextUnlock)}
							>
								<Stack gap={2}>
									<Typography
										variant="body1"
										color="initial"
										sx={{
											userSelect: "none",
											pointerEvents: "none",
											width: "100%",
											whiteSpace: "normal",
											wordBreak: "break-all",
											letterSpacing: "1.3px",
											fontWeight: "500",
										}}
									>
										{randomTextContent}
									</Typography>
									<Typography variant="caption" color="initial" width={"100%"}>
										Type the characters in the field below
									</Typography>
									<Box sx={{ ...modalTextFieldStyle }}>
										<input
											onPaste={(e) => {
												e.preventDefault();
											}}
											type="text"
											style={{ width: "100%", minHeight: "50px" }}
											id="randomTextCount"
											{...register("randomTextContent")}
										/>
									</Box>
									<Button
										type="submit"
										variant="contained"
										sx={{ fontWeight: "600" }}
									>
										Submit
									</Button>
								</Stack>
							</form>
						) : (
							<form
								noValidate
								style={{
									display: "flex",
									flexWrap: "wrap",
									width: "fit-content",
								}}
								onSubmit={handleSubmit(randomTextSubmit)}
							>
								<Stack gap={2}>
									<Box sx={{ ...modalTextFieldStyle }}>
										<input
											maxLength={3}
											style={{ width: "100%" }}
											max={999}
											type="number"
											id="randomTextCount"
											{...register("randomTextCount")}
										/>
									</Box>
									<span>
										Input how many random characters would it generate
									</span>
									<Button
										type="submit"
										variant="contained"
										sx={{ fontWeight: "600" }}
									>
										Submit
									</Button>
								</Stack>
							</form>
						))}
					{config.type === "restrictTimer" && (
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<form
								noValidate
								onSubmit={handleSubmit(restrictTimerSubmit)}
								style={{
									display: "flex",
									flexWrap: "wrap",
								}}
							>
								<Stack gap={3}>
									<Controller
										name="restrictTimer"
										defaultValue={null}
										control={control}
										render={({ field }) => (
											<MobileDateTimePicker
												{...field}
												onChange={(nv) => field.onChange(nv)}
												views={["year", "month", "day", "hours", "minutes"]}
												minDateTime={dayjs()}
												slotProps={{
													textField: {
														fullWidth: true,
														variant: "filled",
														size: "small",
														helperText:
															"Block group will be locked until this time",
													},
												}}
											/>
										)}
									/>

									<Typography variant="body1" color="initial">
										Select the end period for the restriction
									</Typography>
									<Button
										type="submit"
										variant="contained"
										sx={{ fontWeight: "600" }}
									>
										Submit
									</Button>
								</Stack>
							</form>
						</LocalizationProvider>
					)}
				</DialogContent>
				<DialogActions sx={{ mt: 2 }}>
					{config.type && (
						<Button
							onClick={() => {
								setConfigType(null);
								reset();
							}}
						>
							Go back
						</Button>
					)}
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
