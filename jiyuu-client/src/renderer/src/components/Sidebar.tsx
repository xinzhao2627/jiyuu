/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
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
import AbcIcon from "@mui/icons-material/Abc";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
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
				backgroundColor: "#F8F8FF",
				width: "100%",
				display: "flex",
				"& .MuiBottomNavigationAction-root": {
					flex: 1,
					minWidth: 0,
					maxWidth: "none",
				},
				marginY: 1,
			}}
		>
			<BottomNavigationAction
				label="Blockings"
				icon={<VpnLockIcon />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="Dashboard"
				icon={<DashboardIcon />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="Word Bank"
				icon={<AbcIcon />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="Options"
				icon={<TuneIcon />}
				sx={actionStyle}
			/>
		</BottomNavigation>
	);
}
