export function isURL(str: string): boolean {
	const pattern =
		/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
	return pattern.test(str.trim());
}

export function cleanURL(str: string): string {
	return str
		.trim()
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
export function isFilePath(str: string): boolean {
	// Common file path patterns
	const pattern =
		/^([a-zA-Z]:\\|\.{0,2}\/|\/)?([^<>:"|?*\n\r]+[\\/])*[^<>:"|?*\n\r]+\.[a-zA-Z0-9]+$/;
	return pattern.test(str.trim());
}
