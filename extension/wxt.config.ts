import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	manifest: {
		browser_specific_settings: {
			gecko: {
				id: "jiyuu@rainnsoft.com",
				strict_min_version: "109.0",
				data_collection_permissions: {
					required: ["websiteContent"],
				},
			} as any,
		},
		host_permissions: ["http://*/*", "https://*/*"],
	},
});
