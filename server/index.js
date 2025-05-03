const sqlite = require("sqlite3");
const express = require("express");
const db = new sqlite.Database(
	"./jiyuuData.db",
	sqlite.OPEN_READWRITE,
	(err) => {
		if (err) return console.error(err.message);
	}
);
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
	let sites = [];
	db.all("SELECT * FROM blocked_sites", [], (err, rows) => {
		if (err) return console.log("error");
		for (let r of rows) {
			sites.push(r.target_text);
		}
		console.log("sitesss: ", sites);
		res.json({ sites: sites });
	});
});

app.post("/test", (req, res) => {
	console.log("POST /test route called with:", req.body);
	let { desc, keywords, url, title } = req.body;
	// console.log(keywords);

	try {
		url = url.toLowerCase();
		desc = desc.toLowerCase();
		keywords = keywords.toLowerCase();
		title = title.toLowerCase();

		db.all(
			`SELECT 
					bs.target_text as target_text, 
					bg.is_grayscaled as isGrayscaled, 
					bg.is_covered as isCovered, 
					bg.is_muted as isMuted,
					bg.is_activated as isActivated
				FROM blocked_sites as bs 
				LEFT JOIN block_group as bg
					ON bg.id = bs.block_group_id`,
			[],
			(err, rows) => {
				if (err) {
					console.log(err.message);

					res.status(500).send("Error: ", err.message);
					return;
				}
				const clean_url = urlCleaner(url);

				let isActivated = 0,
					isMuted = 0,
					isCovered = 0,
					isGrayscaled = 0;

				for (let i = 0; i < rows.length; i++) {
					const targetText = rows[i].target_text.toLowerCase();
					let targetContent = [desc, keywords, clean_url, title].join(
						" "
					);

					if (targetContent.includes(targetText)) {
						isActivated += Number(rows[i].isActivated);
						isMuted += Number(rows[i].isMuted);
						isGrayscaled += Number(rows[i].isGrayscaled);
						isCovered += Number(rows[i].isCovered);
					}
				}
				console.log({
					inBlockList: true,
					mute: !!isMuted,
					cover: !!isCovered,
					grayscale: !!isGrayscaled,
				});

				res.status(200).json({
					inBlockList: true,
					mute: !!isMuted,
					cover: !!isCovered,
					grayscale: !!isGrayscaled,
				});
				return;
			}
		);
	} catch (e) {
		console.log(e.message);
		res.status(500).send("Error: " + e.message);
	}

	// console.log(
	// 	desc.includes("wuther") ||
	// 		keywords.some((a) => a.includes("wuther")) ||
	// 		url.includes("wuther") ||
	// 		title.includes("wuther")
	// );
});

app.listen(3700, () => console.log("in 3700!"));

function urlCleaner(url) {
	clean = url
		.replace("https://", "")
		.replace("http://", "")
		.replace("www.", "");
	return clean;
}

app.put("/tessst", (req, res) => {
	console.log("wooo");
});
// sql = "CREATE TABLE blocked_sites(id INTEGER PRIMARY KEY, url varchar(255))";

// sql = "INSERT INTO blocked_sites(url) VALUES(?)";

// db.run(sql, ["prima"], (err) => {
// 	if (err) return console.error(err.message);
// });
