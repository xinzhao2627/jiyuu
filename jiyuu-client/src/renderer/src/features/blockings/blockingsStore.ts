import { SxProps } from "@mui/material";
import {
	blocked_content,
	BlockGroup_Full,
	ConfigType,
} from "../../jiyuuInterfaces";
import { create } from "zustand";
import { Theme } from "@emotion/react";

// type empty_func = (c) => void;

// export const useStore = create<Store>((set) => ({
// 	blockGroupData: [],
// 	setBlockGroupData: (c: Array<BlockGroup_Full>) =>
// 		set(() => ({ blockGroupData: c })),

// 	blockedSitesData: [],
// 	setBlockedSitesData: (c: Array<BlockedSites>) =>
// 		set(() => ({ blockedSitesData: c })),

// 	targetTextInput: "",
// 	setTargetTextInput: (c: string) => set(() => ({ targetTextInput: c })),

// 	selectedBlockGroup: null,
// 	setSelectedBlockGroup: (c: BlockGroup_Full) =>
// 		set(() => ({ selectedBlockGroup: c })),

// 	isCoveredState: undefined,
// 	setIsCoveredState: (c: { val: boolean; init_val: boolean } | undefined) =>
// 		set(() => ({ isCoveredState: c })),

// 	isMutedState: undefined,
// 	setIsMutedState: (c: { val: boolean; init_val: boolean } | undefined) =>
// 		set(() => ({ isMutedState: c })),

// 	isGrayscaledState: undefined,
// 	setIsGrayscaledState: (c: { val: boolean; init_val: boolean } | undefined) =>
// 		set(() => ({ isGrayscaledState: c })),

// 	isBlurredState: undefined,
// 	setIsBlurredState: (c: { val: boolean; init_val: boolean } | undefined) =>
// 		set(() => ({ isBlurredState: c })),

// 	isNewGroupModalOpen: false,
// 	setIsNewGroupModalOpen: (c: boolean) =>
// 		set(() => ({ isNewGroupModalOpen: c })),

// 	NewGroupModalInput: "",
// 	setNewGroupModalInput: (c: string) => set(() => ({ NewGroupModalInput: c })),

// 	isDeleteGroupModalOpen: false,
// 	setIsDeleteGroupModalOpen: (c: boolean) =>
// 		set(() => ({ isDeleteGroupModalOpen: c })),

// 	isRenameGroupModalOpen: false,
// 	setIsRenameGroupModalOpen: (c: boolean) =>
// 		set(() => ({ isRenameGroupModalOpen: c })),

// 	RenameGroupModalInput: "",
// 	setRenameGroupModalInput: (c: string) =>
// 		set(() => ({ RenameGroupModalInput: c })),
// 	RenameOldGroupName: "",
// 	setRenameOldGroupName: (c: string) => set(() => ({ RenameOldGroupName: c })),

// 	isBlockingModalOpen: false,
// 	setIsBlockingModalOpen: (c: boolean) =>
// 		set(() => ({ isBlockingModalOpen: c })),

// 	usageTimeValueNumber: undefined,
// 	setUsageTimeValueNumber: (c) => set(() => ({ usageTimeValueNumber: c })),
// 	usageResetPeriod: 0,
// 	setUsageResetPeriod: (c: number) => set(() => ({ usageResetPeriod: c })),

// 	selectedPeriod: "1d",
// 	setSelectedPeriod: (c: "1d" | "1w" | "1m") =>
// 		set(() => ({ selectedPeriod: c })),

// 	// CONFIG MODAL
// 	isConfigModalOpen: false,
// 	setIsConfigModalOpen: (c: boolean) => set(() => ({ isConfigModalOpen: c })),

// 	// config type (from config modal)
// 	configType: "",
// 	setConfigType: (c: string) => set(() => ({ configType: c })),
// }));

// interface Store {
// 	blockGroupData: Array<BlockGroup_Full>;
// 	setBlockGroupData: empty_func;

// 	blockedSitesData: Array<BlockedSites>;
// 	setBlockedSitesData: empty_func;

// 	targetTextInput: string;
// 	setTargetTextInput: empty_func;

// 	// the group id of a clicked group
// 	selectedBlockGroup: BlockGroup_Full | null;
// 	setSelectedBlockGroup: empty_func;

// 	isCoveredState: { val: boolean; init_val: boolean } | undefined;
// 	setIsCoveredState: empty_func;

// 	isMutedState: { val: boolean; init_val: boolean } | undefined;
// 	setIsMutedState: empty_func;

// 	isGrayscaledState: { val: boolean; init_val: boolean } | undefined;
// 	setIsGrayscaledState: empty_func;

// 	isBlurredState: { val: boolean; init_val: boolean } | undefined;
// 	setIsBlurredState: empty_func;

// 	// NEW GROUP MODAL COMPONENT
// 	isNewGroupModalOpen: boolean;
// 	setIsNewGroupModalOpen: empty_func;
// 	NewGroupModalInput: string;
// 	setNewGroupModalInput: empty_func;

// 	// DELETE GROUP MODAL COMPONENT
// 	isDeleteGroupModalOpen: boolean;
// 	setIsDeleteGroupModalOpen: empty_func;

// 	// RENAME GROUP MODAL COMPONENT
// 	isRenameGroupModalOpen: boolean;
// 	setIsRenameGroupModalOpen: empty_func;
// 	RenameGroupModalInput: string;
// 	setRenameGroupModalInput: empty_func;
// 	RenameOldGroupName: string;
// 	setRenameOldGroupName: empty_func;

// 	// USAGE TIMER LIMIT MODAL COMPONENT
// 	usageTimeValueNumber: { val: number; mode: string } | undefined;
// 	setUsageTimeValueNumber: empty_func;
// 	usageResetPeriod: number;
// 	setUsageResetPeriod: empty_func;

// 	// BLOCKING MODAL (show blocked sites of a group)
// 	isBlockingModalOpen: boolean;
// 	setIsBlockingModalOpen: empty_func;

// 	// DASHBOARD
// 	selectedPeriod: "1d" | "1w" | "1m";
// 	setSelectedPeriod: empty_func;

// 	// CONFIG MODAL
// 	isConfigModalOpen: boolean;
// 	setIsConfigModalOpen: empty_func;

// 	// config type (from config modal)
// 	configType: string;
// 	setConfigType: empty_func;
// }

export const menuButtonStyle: SxProps<Theme> = {
	letterSpacing: 0.8,
	fontWeight: 400,
	textTransform: "none",
	fontSize: "16px",
	borderRadius: 0,
};
type MinuteHour = "minute" | "hour";
type DayWeekHour = "d" | "w" | "h";
type BlockedContentStateObject = {
	val: boolean | undefined;
	init_val: boolean | undefined;
} | null;

interface BlockGroupStores {
	blockGroup: {
		selectedBlockGroup: BlockGroup_Full | null;
		data: BlockGroup_Full[];
		modal: Record<"add" | "delete" | "rename" | "blockingModal", boolean>;
	};
	setBlockGroupModal: (
		modalType: keyof BlockGroupStores["blockGroup"]["modal"],
		isOpen: boolean,
	) => void;
	setBlockGroupData: (d: BlockGroup_Full[]) => void;
	setSelectedBlockGroup: (d: BlockGroup_Full | null) => void;
}

interface ConfigStores {
	config: {
		type: ConfigType | null;
		modal: boolean;
		usage: {
			timeValueNumber: { val: number; mode: MinuteHour } | null;
			resetPeriod: DayWeekHour | null;
		};
	};
	setConfigType: (d: ConfigType | null) => void;
	setIsConfigModalOpen: (d: boolean) => void;
	setUsageTimeValueNumber: (
		d: { val: number; mode: MinuteHour } | null,
	) => void;
	setUsageResetPeriod: (d: DayWeekHour | null) => void;
}
export interface BCInput {
	text: string;
	is_whitelist: boolean;
	is_absolute: boolean;
}
interface BlockedContentStores {
	blockedContent: {
		data: blocked_content[];
		states: Record<
			"covered" | "muted" | "grayscaled" | "blurred",
			BlockedContentStateObject
		>;
		input: BCInput;
	};
	setBlockedContentData: (d: blocked_content[]) => void;
	setBlockedContentState: (
		d: keyof BlockedContentStores["blockedContent"]["states"],
		c: BlockedContentStateObject,
	) => void;
	setBlockedContentInput: (d: BCInput) => void;
}

type FinalStore = BlockGroupStores & ConfigStores & BlockedContentStores;

export const useStore = create<FinalStore>((set) => ({
	blockGroup: {
		selectedBlockGroup: null,
		data: [],
		modal: {
			add: false,
			rename: false,
			delete: false,
			blockingModal: false,
		},
	},

	setBlockGroupData: (d) =>
		set((state) => ({
			blockGroup: {
				...state.blockGroup,
				data: d,
			},
		})),
	setBlockGroupModal: (d, c) =>
		set((state) => ({
			blockGroup: {
				...state.blockGroup,
				modal: { ...state.blockGroup.modal, [d]: c },
			},
		})),
	setSelectedBlockGroup: (d) =>
		set((state) => ({
			blockGroup: { ...state.blockGroup, selectedBlockGroup: d },
		})),

	config: {
		type: null,
		modal: false,
		usage: {
			timeValueNumber: { val: 0, mode: "minute" },
			resetPeriod: "h",
		},
	},
	setConfigType: (d) =>
		set((state) => ({
			config: {
				...state.config,
				type: d,
			},
		})),
	setIsConfigModalOpen: (d) =>
		set((state) => ({
			config: {
				...state.config,
				modal: d,
			},
		})),
	setUsageTimeValueNumber: (d) =>
		set((state) => ({
			config: {
				...state.config,
				usage: {
					...state.config.usage,
					timeValueNumber: d ? { val: d.val, mode: d.mode } : null,
				},
			},
		})),
	setUsageResetPeriod: (d) =>
		set((state) => ({
			config: {
				...state.config,
				usage: {
					...state.config.usage,
					resetPeriod: d,
				},
			},
		})),

	blockedContent: {
		data: [],
		states: {
			covered: { val: false, init_val: false },
			muted: { val: false, init_val: false },
			blurred: { val: false, init_val: false },
			grayscaled: { val: false, init_val: false },
		},
		input: {
			text: "",
			is_absolute: false,
			is_whitelist: false,
		},
	},

	setBlockedContentData: (d) =>
		set((state) => ({
			blockedContent: {
				...state.blockedContent,
				data: d,
			},
		})),

	setBlockedContentState: (d, c) =>
		set((state) => ({
			blockedContent: {
				...state.blockedContent,
				states: {
					...state.blockedContent.states,
					[d]: c,
				},
			},
		})),

	setBlockedContentInput: (d) =>
		set((state) => ({
			blockedContent: {
				...state.blockedContent,
				input: d,
			},
		})),
}));
