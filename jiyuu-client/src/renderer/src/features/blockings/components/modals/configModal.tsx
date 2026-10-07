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
	Chip,
	Stack,
} from "@mui/material";
import * as React from "react";
import { useStore } from "../../blockingsStore";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";
import { useForm } from "react-hook-form";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import SpellcheckOutlinedIcon from "@mui/icons-material/SpellcheckOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { UsageLimitForm } from "./configForms/usageLimit";
import { PasswordForm } from "./configForms/password";
import { RandomTextVerify } from "./configForms/randomTextVerify";
import { RandomTextInput } from "./configForms/randomText";
import { RestrictTimerForm } from "./configForms/restrictTimer";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

const configTypeList = [
	{
		title: "Usage Limit",
		type: "usageLimit" as ConfigType,
		subtitle: "Browsing Budget",
		description:
			"Allow a daily or hourly browsing allowance before blocks automatically engage.",
		icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />,
		color: "info.main",
	},
	{
		title: "Random Text",
		type: "randomText" as ConfigType,
		subtitle: "Typing Barrier",
		description:
			"Require typing a generated string of characters to disable or unlock this group.",
		icon: <SpellcheckOutlinedIcon sx={{ fontSize: 20 }} />,
		color: "warning.main",
	},
	{
		title: "Restrict Timer",
		type: "restrictTimer" as ConfigType,
		subtitle: "Scheduled Lockbox",
		description:
			"Lock modifications completely until a designated future date and time arrives.",
		icon: <LockClockOutlinedIcon sx={{ fontSize: 20 }} />,
		color: "secondary.main",
	},
	{
		title: "Password",
		type: "password" as ConfigType,
		subtitle: "Passphrase Shield",
		description:
			"Protect access with a secret passphrase required to modify or unlock the group.",
		icon: <KeyOutlinedIcon sx={{ fontSize: 20 }} />,
		color: "success.main",
	},
];

export default function ConfigModal(): React.JSX.Element {
	const { register, handleSubmit, control, reset, setValue, watch } = useForm();
	const formVal = { register, handleSubmit, control, reset, setValue, watch };
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

	const generateRandomChar = (length: number): void => {
		let res = "";
		const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < length; i++) {
			const randomInd = Math.floor(Math.random() * characters.length);
			res += characters.charAt(randomInd);
		}
		setRandomTextContent(res);
	};

	const currentRestriction = blockGroup.selectedBlockGroup?.restriction_type;
	const isCurrentlyLocked = Boolean(currentRestriction);

	const activeConfigItem = configTypeList.find((c) => c.type === config.type);

	return (
		<Dialog
			open={config.modal}
			onClose={handleClose}
			disableEscapeKeyDown
			transitionDuration={0}
			PaperProps={{
				sx: {
					borderRadius: 1.5,
					width: "calc(100vw - 32px)",
					maxWidth: 580,
					maxHeight: "calc(100vh - 48px)",
					overflow: "hidden",
				},
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					px: 2,
					py: 1.5,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Stack direction="row" alignItems="center" spacing={1}>
					{config.type ? (
						<>
							<IconButton
								size="small"
								aria-label="Back to restrictions"
								onClick={() => {
									setConfigType(null);
									reset();
								}}
								sx={{ color: "text.secondary", mr: 0.5 }}
							>
								<WestOutlinedIcon fontSize="small" />
							</IconButton>
							<Typography variant="subtitle1" fontWeight={700}>
								{activeConfigItem?.title}
							</Typography>
							<Chip
								label={blockGroup.selectedBlockGroup?.group_name || "Group"}
								size="small"
								variant="outlined"
								sx={{ height: 22, fontSize: 11, fontWeight: 500 }}
							/>
						</>
					) : (
						<>
							<Typography variant="subtitle1" fontWeight={700}>
								{blockGroup.selectedBlockGroup?.group_name ||
									"Group Restrictions"}
							</Typography>
							{isCurrentlyLocked && (
								<Chip
									icon={<LockOutlinedIcon sx={{ "&&": { fontSize: 13 } }} />}
									label="Locked"
									size="small"
									color="primary"
									variant="outlined"
									sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
								/>
							)}
						</>
					)}
				</Stack>

				<IconButton
					size="small"
					aria-label="Close"
					onClick={handleClose}
					sx={{ color: "text.secondary" }}
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 2, overflowY: "auto", ...scrollbarStyle }}>
				{!config.type && (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, minmax(0, 1fr))",
							},
							gap: 1.5,
						}}
					>
						{configTypeList.map((card) => {
							const cardType = card.type;
							const isActive =
								blockGroup.selectedBlockGroup?.restriction_type === card.type ||
								(blockGroup.selectedBlockGroup?.usage_label &&
									card.type === "usageLimit");

							const isDisabled =
								cardType !== "usageLimit"
									? cardType === "restrictTimer" && isCurrentlyLocked
										? true
										: isCurrentlyLocked && currentRestriction !== cardType
									: false;

							return (
								<Card
									key={card.type}
									sx={{
										...uiStyles.listItemCard,
										border: "1px solid",
										borderColor: isActive ? "primary.main" : "divider",
										opacity: isDisabled ? 0.45 : 1,
										transition:
											"border-color 0.15s ease, background-color 0.15s ease",
									}}
								>
									<CardActionArea
										disabled={isDisabled}
										onClick={() => {
											if (cardType === "randomText") {
												if (blockGroup.selectedBlockGroup?.configs_json) {
													try {
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
													} catch (err) {
														console.error(err);
													}
												}
											}

											if (cardType === "usageLimit") {
												if (blockGroup.selectedBlockGroup?.configs_json) {
													try {
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
															if (cd.config_type === "usageLimit") {
																setUsageTimeValueNumber({
																	val: cd.usage_reset_value,
																	mode: cd.usage_reset_value_mode,
																});
																setUsageResetPeriod(cd.usage_reset_type);
															}
														}
													} catch (err) {
														console.error(err);
													}
												}
											}

											setConfigType(cardType);
										}}
										sx={{ height: "100%", p: 1.75 }}
									>
										<CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
											<Stack
												direction="row"
												alignItems="center"
												justifyContent="space-between"
												mb={1.25}
											>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														width: 34,
														height: 34,
														borderRadius: 1,
														backgroundColor: "action.hover",
														color: isActive ? "primary.main" : card.color,
													}}
												>
													{card.icon}
												</Box>

												<Stack
													direction="row"
													alignItems="center"
													spacing={0.5}
												>
													{isActive && (
														<Chip
															label="Active"
															size="small"
															color="primary"
															sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
														/>
													)}
													{isDisabled ? (
														<LockOutlinedIcon
															sx={{ fontSize: 15, color: "text.disabled" }}
														/>
													) : (
														<ChevronRightOutlinedIcon
															sx={{ fontSize: 18, color: "text.secondary" }}
														/>
													)}
												</Stack>
											</Stack>

											<Typography variant="subtitle2" fontWeight={700}>
												{card.title}
											</Typography>

											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ mt: 0.5, display: "block", lineHeight: 1.4 }}
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

				{config.type === "usageLimit" && <UsageLimitForm formVal={formVal} />}
				{config.type === "password" && <PasswordForm formVal={formVal} />}
				{config.type === "randomText" &&
					(blockGroup.selectedBlockGroup?.restriction_type === "randomText" ? (
						<RandomTextVerify formVal={formVal} />
					) : (
						<RandomTextInput formVal={formVal} />
					))}
				{config.type === "restrictTimer" && (
					<RestrictTimerForm formVal={formVal} />
				)}
			</DialogContent>

			{!config.type && (
				<DialogActions
					sx={{
						px: 2,
						py: 1.25,
						borderTop: "1px solid",
						borderColor: "divider",
					}}
				>
					<Button size="small" variant="outlined" onClick={handleClose}>
						Done
					</Button>
				</DialogActions>
			)}
		</Dialog>
	);
}
