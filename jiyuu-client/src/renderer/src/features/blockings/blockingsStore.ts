import {
	BlockedSites,
	BlockGroup,
} from "@renderer/shared/types/jiyuuInterfaces";
import { create } from "zustand";

type empty_func = (c) => void;

export const useStore = create<Store>((set) => ({
	blockGroupData: [],
	setBlockGroupData: (c: Array<BlockGroup>) =>
		set(() => ({ blockGroupData: c })),

	blockedSitesData: [],
	setBlockedSitesData: (c: Array<BlockedSites>) =>
		set(() => ({ blockedSitesData: c })),

	targetTextInput: "",
	setTargetTextInput: (c: string) => set(() => ({ targetTextInput: c })),

	selectedBlockGroup: null,
	setSelectedBlockGroup: (c: BlockGroup) =>
		set(() => ({ selectedBlockGroup: c })),

	isCoveredState: false,
	setIsCoveredState: (c: boolean) => set(() => ({ isCoveredState: c })),

	isMutedState: false,
	setIsMutedState: (c: boolean) => set(() => ({ isMutedState: c })),

	isGrayscaledState: false,
	setIsGrayscaledState: (c: boolean) => set(() => ({ isGrayscaledState: c })),

	isBlurredState: false,
	setIsBlurredState: (c: boolean) => set(() => ({ isBlurredState: c })),

	isNewGroupModalOpen: false,
	setIsNewGroupModalOpen: (c: boolean) =>
		set(() => ({ isNewGroupModalOpen: c })),

	NewGroupModalInput: "",
	setNewGroupModalInput: (c: string) => set(() => ({ NewGroupModalInput: c })),

	isDeleteGroupModalOpen: false,
	setIsDeleteGroupModalOpen: (c: boolean) =>
		set(() => ({ isDeleteGroupModalOpen: c })),

	isRenameGroupModalOpen: false,
	setIsRenameGroupModalOpen: (c: boolean) =>
		set(() => ({ isRenameGroupModalOpen: c })),

	RenameGroupModalInput: "",
	setRenameGroupModalInput: (c: string) =>
		set(() => ({ RenameGroupModalInput: c })),
	RenameOldGroupName: "",
	setRenameOldGroupName: (c: string) => set(() => ({ RenameOldGroupName: c })),

	isBlockingModalOpen: false,
	setIsBlockingModalOpen: (c: boolean) =>
		set(() => ({ isBlockingModalOpen: c })),

	usageTimeValueNumber: undefined,
	setUsageTimeValueNumber: (c) => set(() => ({ usageTimeValueNumber: c })),
	usageResetPeriod: 0,
	setUsageResetPeriod: (c: number) => set(() => ({ usageResetPeriod: c })),

	selectedPeriod: "1d",
	setSelectedPeriod: (c: "1d" | "1w" | "1m") =>
		set(() => ({ selectedPeriod: c })),

	// CONFIG MODAL
	isConfigModalOpen: false,
	setIsConfigModalOpen: (c: boolean) => set(() => ({ isConfigModalOpen: c })),

	// config type (from config modal)
	configType: "",
	setConfigType: (c: string) => set(() => ({ configType: c })),
}));

interface Store {
	blockGroupData: Array<BlockGroup>;
	setBlockGroupData: empty_func;

	blockedSitesData: Array<BlockedSites>;
	setBlockedSitesData: empty_func;

	targetTextInput: string;
	setTargetTextInput: empty_func;

	// the group id of a clicked group
	selectedBlockGroup: BlockGroup | null;
	setSelectedBlockGroup: empty_func;

	isCoveredState: boolean;
	setIsCoveredState: empty_func;

	isMutedState: boolean;
	setIsMutedState: empty_func;

	isGrayscaledState: boolean;
	setIsGrayscaledState: empty_func;

	isBlurredState: boolean;
	setIsBlurredState: empty_func;

	// NEW GROUP MODAL COMPONENT
	isNewGroupModalOpen: boolean;
	setIsNewGroupModalOpen: empty_func;
	NewGroupModalInput: string;
	setNewGroupModalInput: empty_func;

	// DELETE GROUP MODAL COMPONENT
	isDeleteGroupModalOpen: boolean;
	setIsDeleteGroupModalOpen: empty_func;

	// RENAME GROUP MODAL COMPONENT
	isRenameGroupModalOpen: boolean;
	setIsRenameGroupModalOpen: empty_func;
	RenameGroupModalInput: string;
	setRenameGroupModalInput: empty_func;
	RenameOldGroupName: string;
	setRenameOldGroupName: empty_func;

	// USAGE TIMER LIMIT MODAL COMPONENT
	usageTimeValueNumber: { val: number; mode: string } | undefined;
	setUsageTimeValueNumber: empty_func;
	usageResetPeriod: number;
	setUsageResetPeriod: empty_func;

	// BLOCKING MODAL (show blocked sites of a group)
	isBlockingModalOpen: boolean;
	setIsBlockingModalOpen: empty_func;

	// DASHBOARD
	selectedPeriod: "1d" | "1w" | "1m";
	setSelectedPeriod: empty_func;

	// CONFIG MODAL
	isConfigModalOpen: boolean;
	setIsConfigModalOpen: empty_func;

	// config type (from config modal)
	configType: string;
	setConfigType: empty_func;
}

export const menuButtonStyle = {
	letterSpacing: 0.8,
	fontWeight: 400,
	textTransform: "none",
	fontSize: "16px",
	borderRadius: 0,
};
