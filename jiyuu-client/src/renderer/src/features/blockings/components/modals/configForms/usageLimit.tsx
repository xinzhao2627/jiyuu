import { Controller, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import { FormInterface, quickSendForms, quickUnlock } from "./quickFunctions";
import { Box, Button, MenuItem, Select, Stack } from "@mui/material";
import {
	BlockGroup_Full,
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/jiyuuInterfaces";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { useStore } from "@renderer/features/blockings/blockingsStore";

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
			config_type: config_type,
		};
		quickSendForms(data, selectedBlockGroup);
	} catch (error) {
		console.log(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}

	handleClose();
};

// reset button for usage limit
const resetButton = (
	selectedBlockGroup: BlockGroup_Full | null,
): React.JSX.Element => {
	return (
		<Button
			color="error"
			variant="outlined"
			disabled={Boolean(selectedBlockGroup?.restriction_type)}
			onClick={() => {
				quickUnlock({ config_type: "usageLimit" }, selectedBlockGroup);
			}}
		>
			Remove usage limit
		</Button>
	);
};

// shows the hour or not depending if there is analready existing resitrction
const hourShower = (
	selectedBlockGroup: BlockGroup_Full | null,
): React.JSX.Element | undefined => {
	let component: React.JSX.Element | undefined = (
		<MenuItem value={"hour"}>hour</MenuItem>
	);
	if (selectedBlockGroup?.configs_json) {
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
				component = undefined;
			}
		}
	}

	return component;
};

export function UsageLimitForm({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, control, reset } = formVal;
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
									{hourShower(blockGroup.selectedBlockGroup)}
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
				<Button type="submit" variant="contained" sx={{ fontWeight: "600" }}>
					Submit
				</Button>
				{/* reset or remove the usage limit */}
				{resetButton(blockGroup.selectedBlockGroup)}
			</Stack>
		</form>
	);
}
