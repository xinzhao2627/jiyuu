// import ShieldIcon from "@mui/icons-material/Shield";
import {
	BottomNavigation,
	BottomNavigationAction,
	SxProps,
	Theme,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AppsIcon from "@mui/icons-material/Apps";
// import VpnLockIcon from "@mui/icons-material/VpnLock";
import { useLocation, useNavigate } from "react-router-dom";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
const actionStyle: SxProps<Theme> = { fontWeight: 600, letterSpacing: 0 };
const iconActionStyle: SxProps<Theme> = { mb: "2px", fontWeight: 400 };
export default function BottomNav(): React.JSX.Element {
	const location = useLocation();
	const navigate = useNavigate();

	const routes = ["/", "/dashboard", "/whitelist", "/option"];
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
					minWidth: 68,
					maxWidth: "none",
					borderRadius: 0,
					color: "text.secondary",
					transition:
						"background-color 0.18s ease, color 0.18s ease, transform 0.18s ease",
				},
				"& .Mui-selected": {
					color: "primary.main",
					transform: "translateY(-1px)",
				},
			}}
		>
			<BottomNavigationAction
				label="Blockings"
				icon={<ShieldOutlinedIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="Dashboard"
				icon={<DashboardOutlinedIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="Whitelist"
				icon={<AppsIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="Options"
				icon={<TuneIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
		</BottomNavigation>
	);
}
