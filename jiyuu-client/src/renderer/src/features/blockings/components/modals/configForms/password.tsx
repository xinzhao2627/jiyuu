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
import { Box, Button, Stack, Typography } from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";

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
				// delete the config to unlock
				quickUnlock({ config_type: cd.config_type }, selectedBlockGroup);
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
const passwordSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const password = fv.password;
		if (!password) throw "The input field is empty";
		quickSendForms(
			{ password: password, config_type: "password" },
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		console.log(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function PasswordForm({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset } = formVal;
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
	return (
		<form
			noValidate
			style={{
				display: "flex",
				flexWrap: "wrap",
				width: "100%",
			}}
			onSubmit={handleSubmit((fv) => {
				if (
					blockGroup.selectedBlockGroup?.restriction_type &&
					blockGroup.selectedBlockGroup.restriction_type === "password"
				) {
					passwordUnlock(fv, handleClose, blockGroup.selectedBlockGroup);
				} else {
					passwordSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
				}
			})}
		>
			<Stack gap={2} width={"100%"}>
				<Box sx={{ ...modalTextFieldStyle, width: "100%" }}>
					<input
						style={{ width: "100%" }}
						type="text"
						id="password"
						placeholder={
							blockGroup.selectedBlockGroup?.restriction_type &&
							blockGroup.selectedBlockGroup.restriction_type === "password"
								? "Enter your password"
								: "Enter a new password"
						}
						{...register("password")}
					/>
					<Typography variant="caption" color="initial">
						{blockGroup.selectedBlockGroup?.restriction_type &&
						blockGroup.selectedBlockGroup.restriction_type === "password"
							? "Enter your password to remove restriction"
							: "Enter a new password"}
					</Typography>
				</Box>
				<Button type="submit" variant="contained" sx={{ fontWeight: "600" }}>
					Submit
				</Button>
			</Stack>
		</form>
	);
}
