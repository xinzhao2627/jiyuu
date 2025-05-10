import { create } from "zustand";

type empty_func = (c) => void;

export const useStore = create<Store>((set) => ({
	blockGroupData: [],
	setblockGroupData: (c: Array<BlockGroup>) =>
		set(() => ({ blockGroupData: c })),

	blockedSitesData: [],
	setblockedSitesData: (c: Array<BlockedSites>) =>
		set(() => ({ blockedSitesData: c })),

	targetTextInput: "",
	setTargetTextInput: (c: string) => set(() => ({ targetTextInput: c })),

	groupIdInput: null,
	setGroupIdInput: (c: number) => set(() => ({ groupIdInput: c })),
}));

interface Store {
	blockGroupData: Array<BlockGroup>;
	setblockGroupData: empty_func;

	blockedSitesData: Array<BlockedSites>;
	setblockedSitesData: empty_func;

	targetTextInput: string;
	setTargetTextInput: empty_func;

	groupIdInput: number | null;
	setGroupIdInput: empty_func;
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
	id: string;
	group_name: string;
}
export interface BlockedSites {
	target_text: string;
	block_group_id: string;
}
