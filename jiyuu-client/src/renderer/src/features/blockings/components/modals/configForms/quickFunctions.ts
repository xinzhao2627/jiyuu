import { ipcRendererSend } from "@renderer/features/blockings/blockingAPI";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import {
	Control,
	FieldValues,
	UseFormHandleSubmit,
	UseFormRegister,
	UseFormReset,
} from "react-hook-form";

export const quickSendForms = (
	data,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	ipcRendererSend("blockgroupconfig/set", {
		id: selectedBlockGroup?.id,
		config_data: data,
	});
};

export const quickUnlock = (
	data: {
		config_type: "usageLimit" | "password" | "randomText";
	},
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	ipcRendererSend("blockgroupconfig/delete", {
		id: selectedBlockGroup?.id,
		config_data: data,
	});
};

export interface FormInterface {
	formVal: {
		register: UseFormRegister<FieldValues>;
		handleSubmit: UseFormHandleSubmit<FieldValues, FieldValues>;
		reset: UseFormReset<FieldValues>;
		control: Control<FieldValues, unknown, FieldValues>;
	};
}
