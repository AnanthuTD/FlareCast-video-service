import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { setupVodNamespace } from "../namespaces/vod.namespace";
import { setupAdminDashboardNamespace } from "../namespaces/adminDashboard.namespace";

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

/* 	io.engine.on("headers", (headers, request) => {
		console.log(request.headers)
		const cookies = parse(request.headers.cookie);
		console.log(cookies)
	
	}); */

	// Apply authentication middleware to all connections
	// io.use(socketAuthMiddleware);

	// Define namespaces
	const vodNamespace = io.of("/");
	const adminDashboardNamespace = io.of("/admin-dashboard");

	// Setup namespace logic
	setupAdminDashboardNamespace(adminDashboardNamespace);
	setupVodNamespace(vodNamespace);

	return io;
}
