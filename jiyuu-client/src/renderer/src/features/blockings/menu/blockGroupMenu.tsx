import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { ipcRendererSend } from "../blockingAPI";
import { useStore } from "../blockingsStore";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export function BlockGroupMenu(): React.JSX.Element {
	const {
		setBlockGroupModal,
		setSelectedBlockGroup,
		setIsConfigModalOpen,
		setBlockGroupMenuAnchor,
		blockGroup,
		// selectedBlockGroup,
	} = useStore();
	const menuAnchor = blockGroup.blockGroupMenuAnchor;
	const setmenuAnchor = setBlockGroupMenuAnchor;
	return (
		<Menu
			anchorEl={menuAnchor?.el}
			open={Boolean(menuAnchor?.el)}
			onClose={() => {
				setmenuAnchor(null);
			}}
		>
			<MenuItem
				disabled={Boolean(menuAnchor?.v.restriction_type)}
				onClick={(e) => {
					e.stopPropagation();
					if (menuAnchor && menuAnchor.v) {
						setSelectedBlockGroup(menuAnchor.v);
						setBlockGroupModal("delete", true);
					}
					setmenuAnchor(null);
				}}
			>
				<ListItemIcon>
					<DeleteIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText sx={{ letterSpacing: 0.7 }}>Delete</ListItemText>
			</MenuItem>
			<MenuItem
				onClick={(e) => {
					e.stopPropagation();
					if (menuAnchor && menuAnchor.v) {
						setSelectedBlockGroup(menuAnchor?.v);
						setBlockGroupModal("rename", true);
					}

					setmenuAnchor(null);
				}}
			>
				<ListItemIcon>
					<DriveFileRenameOutlineIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText sx={{ letterSpacing: 0.7 }}>Rename</ListItemText>
			</MenuItem>
			<MenuItem
				onClick={(e) => {
					e.stopPropagation();
					if (menuAnchor && menuAnchor.v) {
						setSelectedBlockGroup(menuAnchor.v);
						setIsConfigModalOpen(true);
					}
					setmenuAnchor(null);
				}}
			>
				<ListItemIcon>
					<SettingsIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText sx={{ letterSpacing: 0.7 }}>
					Open configuration
				</ListItemText>
			</MenuItem>
			<MenuItem
				onClick={(e) => {
					e.stopPropagation();
					if (menuAnchor && menuAnchor.v) {
						ipcRendererSend("blockedcontent/download", {
							id: menuAnchor.v.id,
							group_name: menuAnchor.v.group_name,
						});
					}
				}}
			>
				<ListItemIcon>
					<FileDownloadIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText sx={{ letterSpacing: 0.7 }}>Export Data</ListItemText>
			</MenuItem>
		</Menu>
	);
}
