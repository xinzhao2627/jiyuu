import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Card,
	CardContent,
	CardActionArea,
	IconButton,
} from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import * as React from "react";
import { useStore } from "../../blockingsStore";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";
import { useForm } from "react-hook-form";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { blue } from "@mui/material/colors";
import { UsageLimitForm } from "./configForms/usageLimit";
import { PasswordForm } from "./configForms/password";
import { RandomTextVerify } from "./configForms/randomTextVerify";
import { RandomTextInput } from "./configForms/randomText";
import { RestrictTimerForm } from "./configForms/restrictTimer";
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
export default function ConfigModal(): React.JSX.Element {
	const { register, handleSubmit, control, reset } = useForm();
	const formVal = { register, handleSubmit, control, reset };
	const {
		config,
		blockGroup,
		setIsConfigModalOpen,
		setConfigType,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setRandomTextContent,
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
					// minWidth: 700,
				}}
				disablePortal={false}
			>
				<DialogTitle
					sx={{
						fontFamily: "roboto",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 1,
						py: 1.5,
						minWidth: 500,
					}}
				>
					{config.type && (
						<IconButton
							aria-label="goback"
							onClick={() => {
								setConfigType(null);
								reset();
							}}
							sx={(theme) => ({
								color: theme.palette.grey[500],
							})}
						>
							<WestOutlinedIcon />
						</IconButton>
					)}
					<Typography
						variant="body2"
						color="initial"
						width={"100%"}
						sx={{ fontWeight: 500, fontSize: 20, mx: 2 }}
					>
						Configure block settings
					</Typography>

					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={(theme) => ({
							color: theme.palette.grey[500],
						})}
					>
						<CloseIcon />
					</IconButton>
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
													if (blockGroup.selectedBlockGroup?.configs_json) {
														const cj = JSON.parse(
															`[${blockGroup.selectedBlockGroup?.configs_json}]`,
														) as {
															config_type: string;
															config_data: string;
														}[];

														for (const c of cj) {
															// console.log(c);

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
					{config.type === "usageLimit" && <UsageLimitForm formVal={formVal} />}
					{config.type === "password" && <PasswordForm formVal={formVal} />}
					{config.type === "randomText" &&
						(blockGroup.selectedBlockGroup?.restriction_type &&
						blockGroup.selectedBlockGroup.restriction_type === "randomText" ? (
							<RandomTextVerify formVal={formVal} />
						) : (
							<RandomTextInput formVal={formVal} />
						))}
					{config.type === "restrictTimer" && (
						<RestrictTimerForm formVal={formVal} />
					)}
				</DialogContent>
				<DialogActions sx={{ mt: 2 }}>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
