import { Service } from "node-windows";

const s = new Service({
	name: "Test service",
	description: "Service for persistent validation",
	script: "./index-service.ts",
});
