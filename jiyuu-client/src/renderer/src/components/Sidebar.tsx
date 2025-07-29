import ShieldIcon from "@mui/icons-material/Shield";
import {
	BottomNavigation,
	BottomNavigationAction,
	SxProps,
	Theme,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AppsIcon from "@mui/icons-material/Apps";
// import VpnLockIcon from "@mui/icons-material/VpnLock";
import { useLocation, useNavigate } from "react-router-dom";
// const ConfigItem: React.FC<{ text: string; callback: (c) => void }> = ({
// 	text,
// 	callback,
// }) => {
// 	return (
// 		<ListItem sx={{ padding: "4px", margin: 0 }}>
// 			<ListItemButton>
// 				<ListItemIcon sx={{ minWidth: "30px" }}>
// 					<AddLocationIcon />
// 				</ListItemIcon>
// 				<ListItemText primary={text} />
// 			</ListItemButton>
// 		</ListItem>
// 	);
// };
const actionStyle: SxProps<Theme> = { fontWeight: 500, letterSpacing: 1 };
const iconActionStyle: SxProps<Theme> = { mb: "2px" };
export default function Sidebar(): React.JSX.Element {
	const location = useLocation();
	const navigate = useNavigate();

	const routes = ["/", "/dashboard", "/apps", "/option"];
	const currentTab = routes.indexOf(location.pathname);
	const handleChange = (
		_event: React.SyntheticEvent,
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
				icon={<ShieldIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="DASHBOARD"
				icon={<DashboardIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="APPS"
				icon={<AppsIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="OPTION"
				icon={<TuneIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
		</BottomNavigation>
	);
}
