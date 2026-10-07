import * as React from "react";
import { Controller, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import { FormInterface, quickSendForms, quickUnlock } from "./quickFunctions";
import {
	Button,
	IconButton,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {
	BlockGroup_Full,
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { useStore } from "@renderer/features/blockings/blockingsStore";

const PRESETS = [
	{ label: "15m", val: 15, mode: "minute" as const },
	{ label: "30m", val: 30, mode: "minute" as const },
	{ label: "45m", val: 45, mode: "minute" as const },
	{ label: "1h", val: 1, mode: "hour" as const },
	{ label: "2h", val: 2, mode: "hour" as const },
];

const usageSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
	config_type: ConfigType | null,
): void => {
	try {
		const val = Number(fv.usageValue);
		const mode = fv.timeValueMode;
		const period = fv.usageResetPeriod;

		if (
			!(
				!Number.isNaN(val) &&
				val > 0 &&
				["minute", "hour"].includes(mode) &&
				["d", "w", "h"].includes(period)
			)
		) {
			toast.error("Please enter a valid time value");
			return;
		}

		const rawVal =
			mode === "minute" ? val * 60 : mode === "hour" ? val * 60 * 60 : val;
		if (
			(period === "d" && rawVal > 86400) ||
			(period === "w" && rawVal > 604800) ||
			(period === "h" && rawVal > 3600)
		) {
			toast.error("Usage limit cannot exceed the chosen reset interval");
			return;
		}

		quickSendForms(
			{
				usage_reset_type: period,
				usage_reset_value: val,
				usage_reset_value_mode: mode,
				config_type: config_type,
			},
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

const canSelectHours = (
	selectedBlockGroup: BlockGroup_Full | null,
): boolean => {
	if (selectedBlockGroup?.configs_json) {
		try {
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
				if (
					Boolean(selectedBlockGroup?.restriction_type) &&
					cd.config_type === "usageLimit" &&
					cd.usage_reset_value_mode === "minute"
				) {
					return false;
				}
			}
		} catch (e) {
			console.error(e);
		}
	}
	return true;
};

export function UsageLimitForm({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, control, reset, setValue, watch } = formVal;
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

	const hasExistingLimit = Boolean(blockGroup.selectedBlockGroup?.usage_label);
	const hoursAllowed = canSelectHours(blockGroup.selectedBlockGroup);

	// Watch values for live summary display
	const currentVal = watch(
		"usageValue",
		config.usage.timeValueNumber?.val || 30,
	);
	const currentMode = watch(
		"timeValueMode",
		config.usage.timeValueNumber?.mode || "minute",
	);
	const currentPeriod = watch(
		"usageResetPeriod",
		config.usage.resetPeriod || "d",
	);

	const handlePresetClick = (val: number, mode: "minute" | "hour"): void => {
		if (mode === "hour" && !hoursAllowed) return;
		setValue("usageValue", val);
		setValue("timeValueMode", mode);
	};

	const handleStep = (delta: number): void => {
		const val = Math.max(1, (Number(currentVal) || 0) + delta);
		setValue("usageValue", val);
	};

	const periodName =
		currentPeriod === "h" ? "hour" : currentPeriod === "d" ? "day" : "week";

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv) =>
				usageSubmit(
					fv,
					handleClose,
					blockGroup.selectedBlockGroup,
					config.type,
				),
			)}
		>
			<Stack spacing={2.5} pt={0.5}>
				{/* Live Budget Readout Header */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 1.5,
						borderRadius: 1.5,
						border: "1px solid",
						borderColor: "divider",
						backgroundColor: "action.hover",
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.25}>
						<TimerOutlinedIcon
							fontSize="small"
							sx={{ color: "primary.main" }}
						/>
						<Typography variant="body2" fontWeight={600}>
							{currentVal || 0} {currentMode === "minute" ? "minutes" : "hours"}{" "}
							per {periodName}
						</Typography>
					</Stack>

					{hasExistingLimit && (
						<Typography
							variant="caption"
							sx={{
								color: "primary.main",
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
							Currently active
						</Typography>
					)}
				</Box>

				{/* Quick Presets Strip */}
				<Stack direction="row" spacing={1} flexWrap="wrap">
					{PRESETS.map((p) => {
						const isSelected =
							Number(currentVal) === p.val && currentMode === p.mode;
						const isDisabled = p.mode === "hour" && !hoursAllowed;
						return (
							<Button
								key={p.label}
								size="small"
								disabled={isDisabled}
								variant={isSelected ? "contained" : "outlined"}
								onClick={() => handlePresetClick(p.val, p.mode)}
								sx={{
									minWidth: 54,
									height: 30,
									fontSize: 12,
									fontWeight: isSelected ? 700 : 500,
									borderRadius: 1,
								}}
							>
								{p.label}
							</Button>
						);
					})}
				</Stack>

				{/* Amount Stepper & Unit Selector */}
				<Stack direction="row" spacing={1} alignItems="center">
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 1,
							bgcolor: "background.paper",
							flex: 1,
							px: 0.5,
						}}
					>
						<IconButton
							size="small"
							onClick={() => handleStep(-5)}
							disabled={Number(currentVal) <= 1}
							sx={{ color: "text.secondary" }}
						>
							<RemoveIcon fontSize="small" />
						</IconButton>

						<TextField
							size="small"
							type="number"
							variant="standard"
							fullWidth
							inputProps={{
								min: 1,
								style: {
									textAlign: "center",
									fontWeight: 600,
									fontSize: "0.95rem",
								},
							}}
							InputProps={{ disableUnderline: true }}
							{...register("usageValue")}
							defaultValue={config.usage.timeValueNumber?.val || 30}
						/>

						<IconButton
							size="small"
							onClick={() => handleStep(5)}
							sx={{ color: "text.secondary" }}
						>
							<AddIcon fontSize="small" />
						</IconButton>
					</Box>

					<Controller
						name="timeValueMode"
						control={control}
						defaultValue={config.usage.timeValueNumber?.mode || "minute"}
						render={({ field }) => (
							<Select
								{...field}
								size="small"
								sx={{
									minWidth: 110,
									height: 38,
									borderRadius: 1,
								}}
							>
								<MenuItem value="minute">minutes</MenuItem>
								{hoursAllowed && <MenuItem value="hour">hours</MenuItem>}
							</Select>
						)}
					/>
				</Stack>

				{/* Reset Cycle Toggle Group */}
				<Controller
					name="usageResetPeriod"
					defaultValue={config.usage.resetPeriod || "d"}
					control={control}
					render={({ field }) => (
						<ToggleButtonGroup
							value={field.value}
							exclusive
							onChange={(_, val) => {
								if (val) field.onChange(val);
							}}
							fullWidth
							size="small"
							sx={{
								"& .MuiToggleButton-root": {
									height: 34,
									fontSize: 12,
									fontWeight: 600,
									textTransform: "none",
									borderRadius: 1,
								},
							}}
						>
							<ToggleButton value="h">Reset hourly</ToggleButton>
							<ToggleButton value="d">Reset daily</ToggleButton>
							<ToggleButton value="w">Reset weekly</ToggleButton>
						</ToggleButtonGroup>
					)}
				/>

				{/* Action Buttons */}
				<Stack direction="row" spacing={1} pt={0.5}>
					<Button
						type="submit"
						variant="contained"
						size="small"
						sx={{ flex: 1, height: 36, fontWeight: 600 }}
					>
						{hasExistingLimit ? "Update Limit" : "Apply Limit"}
					</Button>

					{hasExistingLimit && (
						<Button
							color="error"
							variant="outlined"
							size="small"
							startIcon={<DeleteOutlineIcon fontSize="small" />}
							disabled={Boolean(
								blockGroup.selectedBlockGroup?.restriction_type,
							)}
							onClick={() => {
								quickUnlock(
									{ config_type: "usageLimit" },
									blockGroup.selectedBlockGroup,
								);
								handleClose();
							}}
							sx={{ height: 36, px: 2, borderRadius: 1 }}
						>
							Remove
						</Button>
					)}
				</Stack>
			</Stack>
		</form>
	);
}
