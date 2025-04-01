import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { setupAdminDashboardNamespace } from "./namespaces/adminDashboard.namespace";
import { setupVodNamespace } from "./namespaces/vod.namespace";

export function initializeSocket(server: HttpServer) {
	const io = new Server(server, {
		cors: {
			origin: ["*"],
			methods: ["GET", "POST"],
			credentials: true,
		},
		cookie: true,
	});

	io.on("connection", () => {
		console.log("Client connected");

		// Handle disconnections
		io.on("disconnect", () => {
			console.log("Client disconnected");
		});
	});

	// Define namespaces
	const vodNamespace = io.of("/");
	const adminDashboardNamespace = io.of("/admin-dashboard");

	// Setup namespace logic
	setupAdminDashboardNamespace(adminDashboardNamespace);
	setupVodNamespace(vodNamespace);

	return io;
}
