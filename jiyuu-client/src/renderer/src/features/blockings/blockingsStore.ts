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

	isCoveredState: 0,
	setIsCoveredState: (c: number) => set(() => ({ isCoveredState: c })),

	isMutedState: 0,
	setIsMutedState: (c: number) => set(() => ({ isMutedState: c })),

	isGrayscaledState: 0,
	setIsGrayscaledState: (c: number) => set(() => ({ isGrayscaledState: c })),

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

	// USAGE TIMER LIMIT MODAL COMPONENT - Added implementations
	isUsageLimitModalOpen: false,
	setUsageLimitModalOpen: (c: boolean) =>
		set(() => ({ isUsageLimitModalOpen: c })),
	usageTimeValueNumber: 0,
	setUsageTimeValueNumber: (c: number) =>
		set(() => ({ usageTimeValueNumber: c })),
	usageResetPeriod: 0,
	setUsageResetPeriod: (c: number) => set(() => ({ usageResetPeriod: c })),

	selectedPeriod: "1d",
	setSelectedPeriod: (c: "1d" | "1w" | "1m") =>
		set(() => ({ selectedPeriod: c })),
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

	isCoveredState: number;
	setIsCoveredState: empty_func;

	isMutedState: number;
	setIsMutedState: empty_func;

	isGrayscaledState: number;
	setIsGrayscaledState: empty_func;

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
	isUsageLimitModalOpen: boolean;
	setUsageLimitModalOpen: empty_func;
	usageTimeValueNumber: number;
	setUsageTimeValueNumber: empty_func;
	usageResetPeriod: number;
	setUsageResetPeriod: empty_func;

	// BLOCKING MODAL (show blocked sites of a group)
	isBlockingModalOpen: boolean;
	setIsBlockingModalOpen: empty_func;

	selectedPeriod: "1d" | "1w" | "1m";
	setSelectedPeriod: empty_func;
}

export const menuButtonStyle = {
	letterSpacing: 0.5,
	fontWeight: 700,
	textTransform: "none",
	fontSize: "16px",
};
