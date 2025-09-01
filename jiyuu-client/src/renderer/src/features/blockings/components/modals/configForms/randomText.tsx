import { FieldValues } from "react-hook-form";
import { FormInterface, quickSendForms } from "./quickFunctions";
import { useStore } from "@renderer/features/blockings/blockingsStore";
import { Box, Button, Stack } from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import toast from "react-hot-toast";
const randomTextSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const randomTextCount = Number(fv.randomTextCount);
		if (!randomTextCount || Number.isNaN(randomTextCount))
			throw "Invalid character count";
		if (randomTextCount > 999) {
			throw "Must be at most 3 digits only";
		}
		quickSendForms(
			{
				randomTextCount: randomTextCount,
				config_type: "randomText",
			},
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		console.log(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RandomTextInput({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset } = formVal;
	const {
		blockGroup,
		setConfigType,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setRandomTextContent,
		setIsConfigModalOpen,
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
				width: "fit-content",
			}}
			onSubmit={handleSubmit((fv) => {
				randomTextSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
			})}
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
				<span>Input how many random characters would it generate</span>
				<Button type="submit" variant="contained" sx={{ fontWeight: "600" }}>
					Submit
				</Button>
			</Stack>
		</form>
	);
}
