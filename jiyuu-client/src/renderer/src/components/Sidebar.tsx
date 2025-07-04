/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import ShieldIcon from "@mui/icons-material/Shield";
import {
	BottomNavigation,
	BottomNavigationAction,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	SxProps,
	Theme,
} from "@mui/material";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import TuneIcon from "@mui/icons-material/Tune";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
// import VpnLockIcon from "@mui/icons-material/VpnLock";
import { Link, useLocation, useNavigate } from "react-router-dom";
const ConfigItem: React.FC<{ text: string; callback: (c) => void }> = ({
	text,
	callback,
}) => {
	return (
		<ListItem sx={{ padding: "4px", margin: 0 }}>
			<ListItemButton>
				<ListItemIcon sx={{ minWidth: "30px" }}>
					<AddLocationIcon />
				</ListItemIcon>
				<ListItemText primary={text} />
			</ListItemButton>
		</ListItem>
	);
};
const actionStyle: SxProps<Theme> = { fontWeight: 600, letterSpacing: 0.2 };
export default function Sidebar(): React.JSX.Element {
	const location = useLocation();
	const navigate = useNavigate();

	const routes = ["/", "/dashboard", "/wordbank", "/options"];
	const currentTab = routes.indexOf(location.pathname);
	const handleChange = (
		event: React.SyntheticEvent,
		newValue: number,
	): void => {
		navigate(routes[newValue]);
	};
	return (
		<BottomNavigation
			value={currentTab}
			onChange={handleChange}
			showLabels
			sx={{
				backgroundColor: "transparent",
				width: "100%",
				display: "flex",
				"& .MuiBottomNavigationAction-root": {
					flex: 1,
					minWidth: 0,
					maxWidth: "none",
				},
				padding: 1,
				// backdropFilter: "blur(2px)",
			}}
		>
			<BottomNavigationAction
				label="BLOCKINGS"
				icon={<ShieldIcon />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="DASHBOARD"
				icon={<DashboardIcon />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="WORD BANK"
				icon={<FontDownloadIcon />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="OPTIONS"
				icon={<TuneIcon />}
				sx={actionStyle}
			/>
		</BottomNavigation>
	);
}
