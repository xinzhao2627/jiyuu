/* eslint-disable @typescript-eslint/no-unused-vars */
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface TopKpiProps {
	title: string;
	content: string | number;
}
export default function TopKpi({
	title,
	content,
}: TopKpiProps): React.JSX.Element {
	return (
		<Card sx={{ minWidth: 275, boxShadow: "none", textAlign: "center" }}>
			<CardContent>
				<Typography mb={1} sx={{ fontSize: 28, fontWeight: 700 }}>
					{title}
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: "text.secondary", fontSize: 24 }}
					fontWeight={"100"}
				>
					{content}
				</Typography>
			</CardContent>
		</Card>
	);
}
