export interface Feedback_data {
	desc: string | undefined;
	keywords: string | undefined;
	url: string | undefined;
	title: string | undefined;
}
export interface Feedback {
	status: number;
	data: Feedback_data;
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
