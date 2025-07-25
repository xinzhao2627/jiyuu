import { SiteAttribute, TimeListInterface } from "../lib/jiyuuInterfaces";

export function siteIncludes(
	siteData: SiteAttribute | TimeListInterface,
	target: string,
	isact: 0 | 1,
): boolean {
	return (
		Boolean(isact) &&
		(siteData.desc?.includes(target) ||
			siteData.keywords?.includes(target) ||
			siteData.title?.includes(target) ||
			siteData.url?.includes(target))
	);
}

export function showError(
	err: unknown,
	event: Electron.IpcMainEvent,
	indication: string,
	channel: string,
): void {
	const errorMsg = err instanceof Error ? err.message : String(err);
	console.error(indication, errorMsg);
	event.reply(channel, {
		error: errorMsg,
	});
}
