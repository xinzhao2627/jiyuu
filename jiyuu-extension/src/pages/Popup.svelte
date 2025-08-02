<script lang="ts">
	import browser from "webextension-polyfill";
	let textContent = "";
	let incogClassName = "status-value enabled";
	console.log("Hello from the popup!");

	browser.extension.isAllowedIncognitoAccess().then((isAllowedAccess) => {
		if (isAllowedAccess) {
			textContent = "Enabled";
			incogClassName = "status-value enabled";
		} else {
			textContent = "Disabled";
			incogClassName = "status-value disabled";
		}
	});
</script>

<div>
	<div class="title">Jiyuu - Website Blocker</div>
	<div class="status" style="margin-bottom: 20px">
		<span class="status-text">Allowed in incognito:</span>
		<span class={incogClassName} id="status-text">{" " + textContent}</span>
	</div>
</div>

<style>
</style>
