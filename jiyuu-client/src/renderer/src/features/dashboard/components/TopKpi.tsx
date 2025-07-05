/* eslint-disable @typescript-eslint/no-unused-vars */
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

interface TopKpiProps {
	title: string;
	content: React.JSX.Element;
	icon: React.JSX.Element;
}

export default function TopKpi({
	title,
	content,
	icon,
}: TopKpiProps): React.JSX.Element {
	return (
		<Card
			sx={{
				minWidth: 275,
				padding: 1,
			}}
		>
			<CardContent>
				<Stack direction={"row"} alignItems={"center"}>
					<div style={{ height: "100%", marginBottom: "0.33em" }}>{icon}</div>
					<Typography mb={1} mx={1} variant="h6" fontWeight={600}>
						{title}
					</Typography>
				</Stack>

				{content}
			</CardContent>
		</Card>
	);
}
