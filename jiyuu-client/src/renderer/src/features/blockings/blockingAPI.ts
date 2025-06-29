// export const text_target_put_response = (): void => {
// 	window.electron.ipcRenderer.on;
// };

// export const text_target_put = (
// 	targetTextInput: string,
// 	groupIdInput: number | null,
// ): void => {
// 	window.electron.ipcRenderer.send("targettext/put", {
// 		target_text: targetTextInput,
// 		group_id: groupIdInput,
// 	});
// };



export const ipcRendererOn = (
	query: string,
	callback: (event: Electron.IpcRendererEvent, data) => void,
): void => {


	window.electron.ipcRenderer.on(query, callback);
};

export const ipcRendererSend = (
	query: string,
	body: Record<string, unknown> | undefined,
): void => {
	if (!body) window.electron.ipcRenderer.send(query);
	else window.electron.ipcRenderer.send(query, body);
};
