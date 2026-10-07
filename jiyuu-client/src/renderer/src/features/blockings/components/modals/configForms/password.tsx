import * as React from "react";
import {
	BlockGroup_Full,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { FieldValues } from "react-hook-form";
import { FormInterface, quickSendForms, quickUnlock } from "./quickFunctions";
import toast from "react-hot-toast";
import { useStore } from "@renderer/features/blockings/blockingsStore";
import {
	Button,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
	Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";

const passwordUnlock = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		let isSuccess = false;
		const password = fv.password;
		const cj = JSON.parse(`[${selectedBlockGroup?.configs_json}]`) as {
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
				quickUnlock({ config_type: cd.config_type }, selectedBlockGroup);
				isSuccess = true;
			}
		}
		if (isSuccess) {
			toast.success("Restriction unlocked");
			handleClose();
		} else {
			toast.error("Incorrect password");
		}
	} catch (error) {
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

const passwordSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const password = fv.password?.trim();
		if (!password) {
			toast.error("Password cannot be blank");
			return;
		}
		quickSendForms(
			{ password: password, config_type: "password" },
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function PasswordForm({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset, watch } = formVal;
	const [showPassword, setShowPassword] = React.useState<boolean>(false);
	const {
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

	const isLocked =
		blockGroup.selectedBlockGroup?.restriction_type === "password";

	const enteredPassword = watch("password", "");

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv) => {
				if (isLocked) {
					passwordUnlock(fv, handleClose, blockGroup.selectedBlockGroup);
				} else {
					passwordSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
				}
			})}
		>
			<Stack spacing={2.5} pt={0.5}>
				{/* Status Hero Card */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 1.5,
						borderRadius: 1.5,
						border: "1px solid",
						borderColor: isLocked ? "primary.main" : "divider",
						backgroundColor: "action.hover",
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.25}>
						{isLocked ? (
							<LockOutlinedIcon
								fontSize="small"
								sx={{ color: "primary.main" }}
							/>
						) : (
							<KeyOutlinedIcon
								fontSize="small"
								sx={{ color: "text.secondary" }}
							/>
						)}
						<Typography variant="body2" fontWeight={600}>
							{isLocked ? "Group is currently locked" : "Set access passphrase"}
						</Typography>
					</Stack>

					<Typography
						variant="caption"
						sx={{
							color: isLocked ? "primary.main" : "text.secondary",
							fontWeight: 600,
							fontSize: 11,
							px: 1,
							py: 0.25,
							borderRadius: 1,
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						{isLocked ? "Protected" : "Unlocked"}
					</Typography>
				</Box>

				{/* Password Input with Visibility Toggle */}
				<TextField
					size="small"
					type={showPassword ? "text" : "password"}
					fullWidth
					autoFocus
					placeholder={
						isLocked ? "Enter password to unlock" : "Choose a lock passphrase"
					}
					{...register("password")}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<LockOutlinedIcon
									fontSize="small"
									sx={{ color: "text.secondary" }}
								/>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									size="small"
									aria-label="toggle password visibility"
									onClick={() => setShowPassword(!showPassword)}
									edge="end"
									sx={{ color: "text.secondary" }}
								>
									{showPassword ? (
										<VisibilityOffOutlinedIcon fontSize="small" />
									) : (
										<VisibilityOutlinedIcon fontSize="small" />
									)}
								</IconButton>
							</InputAdornment>
						),
					}}
				/>

				{/* Action Button */}
				<Button
					type="submit"
					variant="contained"
					size="small"
					disabled={!enteredPassword?.trim()}
					startIcon={
						isLocked ? (
							<LockOpenOutlinedIcon fontSize="small" />
						) : (
							<LockOutlinedIcon fontSize="small" />
						)
					}
					sx={{ height: 38, fontWeight: 600, borderRadius: 1 }}
				>
					{isLocked ? "Unlock Group" : "Lock Group"}
				</Button>
			</Stack>
		</form>
	);
}
