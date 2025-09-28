import { SxProps } from "@mui/material";
import {
	blocked_content,
	BlockGroup_Full,
	ConfigType,
} from "../../jiyuuInterfaces";
import { create } from "zustand";
import { Theme } from "@emotion/react";

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
		modal: Record<
			"add" | "delete" | "rename" | "blockingModal" | "deactivateGroupModal",
			boolean
		>;
		blockGroupMenuAnchor: null | { el: HTMLElement; v: BlockGroup_Full };
		fabGroupMenuAnchor: HTMLElement | null;
	};
	setBlockGroupModal: (
		modalType: keyof BlockGroupStores["blockGroup"]["modal"],
		isOpen: boolean,
	) => void;
	setBlockGroupData: (d: BlockGroup_Full[]) => void;
	setSelectedBlockGroup: (d: BlockGroup_Full | null) => void;
	setBlockGroupMenuAnchor: (
		d: null | { el: HTMLElement; v: BlockGroup_Full },
	) => void;
	setFabGroupMenuAnchor: (d: HTMLElement | null) => void;
}

interface ConfigStores {
	config: {
		type: ConfigType | null;
		modal: boolean;
		usage: {
			timeValueNumber: { val: number; mode: MinuteHour } | null;
			resetPeriod: DayWeekHour | null;
		};
		randomTextContent: string;
	};
	setConfigType: (d: ConfigType | null) => void;
	setIsConfigModalOpen: (d: boolean) => void;
	setUsageTimeValueNumber: (
		d: { val: number; mode: MinuteHour } | null,
	) => void;
	setUsageResetPeriod: (d: DayWeekHour | null) => void;
	setRandomTextContent: (d: string) => void;
}
export interface BCInput {
	text: string;
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
			deactivateGroupModal: false,
		},
		blockGroupMenuAnchor: null,
		fabGroupMenuAnchor: null,
	},
	setBlockGroupMenuAnchor: (d) => {
		set((state) => ({
			blockGroup: {
				...state.blockGroup,
				blockGroupMenuAnchor: d,
			},
		}));
	},
	setFabGroupMenuAnchor: (d) => {
		set((state) => ({
			blockGroup: {
				...state.blockGroup,
				fabGroupMenuAnchor: d,
			},
		}));
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
		randomTextContent: "",
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
	setRandomTextContent: (d) =>
		set((state) => ({
			config: {
				...state.config,
				randomTextContent: d,
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
