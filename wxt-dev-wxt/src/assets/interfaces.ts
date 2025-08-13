export interface Feedback_data {
	desc: string | undefined;
	keywords: string | undefined;
	url: string | undefined;
	title: string | undefined;
}
export interface Feedback {
	status: number;
	data: Feedback_data | null;
	error: string;
}

export interface TimeListData extends Feedback_data {
	secondsElapsed: number;
	startTime: Date;
	lastLogTime: Date;
	tabId: number;
	dateObject: string;
	baseUrl: string;
	fullUrl: string;
}
export interface BlockParam {
	is_covered: 0 | 1;
	is_muted: 0 | 1;
	is_grayscaled: 0 | 1;
	is_blurred: 0 | 1;
}
export interface SentData {
	tabId: number;
	isBlocked: boolean;
	message: string;
	following_detected_texts: string[];
	blockParam: BlockParam;
}
