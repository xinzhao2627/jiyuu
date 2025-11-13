import { useStore } from "../blockingsStore";
// import { ipcRendererSend } from "../blockingAPI";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ipcRendererSend } from "../blockingAPI";
import { useRef } from "react";
export function ExportAndImportBlockGroup(): React.JSX.Element {
	const { setFabGroupMenuAnchor, blockGroup } = useStore();
	const anchorEl = blockGroup.fabGroupMenuAnchor;
	const inputFile = useRef<HTMLInputElement>(null);

	return (
		<>
			<input
				type="file"
				accept=".json"
				ref={inputFile}
				style={{ display: "none" }}
				onChange={(e) => {
					const { files } = e.target;
					console.log(files);

					if (files && files.length) {
						const file = files[0];
						const filename = files[0].name;
						const p = filename.split(".");
						const fileType = p[p.length - 1];

						if (fileType === "json") {
							console.log("file is json");

							const reader = new FileReader();

							reader.onload = (event) => {
								const c = event.target?.result as string;
								console.log("c", c);
								ipcRendererSend("jiyuu/import", { json_string: c });
							};
							reader.readAsText(file);
						}
					}
				}}
			/>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => {
					setFabGroupMenuAnchor(null);
				}}
			>
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						ipcRendererSend("jiyuu/export", {});
					}}
				>
					<ListItemIcon>
						<FileDownloadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ letterSpacing: 0.7 }}>
						Export everything as JSON
					</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						inputFile.current?.click();
						// ipcRendererSend("jiyuu/import", {});
					}}
				>
					<ListItemIcon>
						<FileUploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ letterSpacing: 0.7 }}>
						Import JSON file
					</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
}
