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
	setSelectedBlockGroup: (c: number | null) =>
		set(() => ({ selectedBlockGroup: c })),

	isCoveredState: false,
	setIsCoveredState: (c: boolean) => set(() => ({ isCoveredState: c })),

	isMutedState: false,
	setIsMutedState: (c: boolean) => set(() => ({ isMutedState: c })),

	isGrayscaledState: false,
	setIsGrayscaledState: (c: boolean) => set(() => ({ isGrayscaledState: c })),

	isNewGroupModalOpen: false,
	setIsNewGroupModalOpen: (c: boolean) =>
		set(() => ({ isNewGroupModalOpen: c })),

	NewGroupModalInput: "",
	setNewGroupModalInput: (c: string) => set(() => ({ NewGroupModalInput: c })),
}));

interface Store {
	blockGroupData: Array<BlockGroup>;
	setBlockGroupData: empty_func;

	blockedSitesData: Array<BlockedSites>;
	setBlockedSitesData: empty_func;

	targetTextInput: string;
	setTargetTextInput: empty_func;

	selectedBlockGroup: number | null;
	setSelectedBlockGroup: empty_func;

	isCoveredState: boolean;
	setIsCoveredState: empty_func;

	isMutedState: boolean;
	setIsMutedState: empty_func;

	isGrayscaledState: boolean;
	setIsGrayscaledState: empty_func;

	// NEW GROUP MODAL COMPONENT
	isNewGroupModalOpen: boolean;
	setIsNewGroupModalOpen: empty_func;
	NewGroupModalInput: string;
	setNewGroupModalInput: empty_func;
}

export interface SiteAttribute {
	desc: string;
	keywords: string;
	url: string;
	title: string;
	descDoc: string;
	keywordsDoc: string;
}
export interface BlockParameters {
	is_grayscaled: 0 | 1;
	is_covered: 0 | 1;
	is_muted: 0 | 1;
}
export interface BlockGroup extends BlockParameters {
	id: number;
	group_name: string;
	is_activated: 0 | 1;
}
export interface BlockedSites {
	target_text: string;
	block_group_id: number;
}
export const menuButtonStyle = {
	letterSpacing: 0.5,
	fontWeight: 700,
	textTransform: "none",
	fontSize: "16px",
};
