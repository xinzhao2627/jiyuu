import { useStore } from "../blockingsStore";
// import { ipcRendererSend } from "../blockingAPI";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
export function ExportAndImportBlockGroup(): React.JSX.Element {
	const { setFabGroupMenuAnchor, blockGroup } = useStore();
	const anchorEl = blockGroup.fabGroupMenuAnchor;
	return (
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
					// ipcRendererSend("blockedcontent/download", {});
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
					// ipcRendererSend("blockedcontent/download", {});
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
	);
}
