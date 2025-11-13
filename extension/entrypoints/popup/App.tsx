import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import "./App.css";

function App() {
	const [textContent, setTextContent] = useState("");
	const [incogClassName, setIncogClassName] = useState(
		"status-value enabled"
	);

	useEffect(() => {
		console.log("Hello from the popup!");

		browser.extension.isAllowedIncognitoAccess().then((isAllowedAccess) => {
			if (isAllowedAccess) {
				setTextContent("Enabled");
				setIncogClassName("status-value enabled");
			} else {
				setTextContent("Disabled");
				setIncogClassName("status-value disabled");
			}
		});
	}, []);

	return (
		<div style={{ padding: "4px" }}>
			<div className="title">Jiyuu - Website Blocker Extension</div>
			<div style={{ padding: "4px", letterSpacing: 0.7 }}>
				<div className="status" style={{ marginBottom: "20px" }}>
					<span className="status-text">Allowed in incognito:</span>
					<span className={incogClassName} id="status-text">
						{" " + textContent}
					</span>
				</div>
				<div className="status" style={{ marginBottom: "20px" }}>
					<span className="status-text">
						This extension connects to the Jiyuu Desktop App. Sites
						that are set to be blocked in the jiyuu app are blocked
						automatically upon view.
					</span>
				</div>
				<div className="status" style={{ marginBottom: "20px" }}>
					<span className="status-text">
						Don't uninstall or disable this extension if there are
						active block groups from the desktop app to prevent your
						browser from closing.
					</span>
				</div>
				<div className="status" style={{ marginBottom: "20px" }}>
					<span className="status-text">
						If you encountered bugs or have any concerns, please
						send an email to Jiyuu.
					</span>
				</div>
				<div className="status" style={{ marginBottom: "20px" }}>
					<span className="status-text">
						For future updates, check out the project repository or
						sign up to the newsletter!
					</span>
				</div>
			</div>
		</div>
	);
}

export default App;
