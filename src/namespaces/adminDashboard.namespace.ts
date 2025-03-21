import { Namespace, Socket } from "socket.io";
import eventEmitter from "../eventEmitter";
import EventName from "../eventEmitter/eventNames";
import { authenticateWebsocketAdmin } from "../middleware/socketAuth.middleware";
import { VideoRepository } from "../repository/video.repository";

export const setupAdminDashboardNamespace = (namespace: Namespace) => {
	namespace.use(authenticateWebsocketAdmin);

	namespace.on("connection", async (socket: Socket) => {
		console.log(
			`🟢 Admin ${socket.id} connected to /admin-dashboard adminId: ${socket.admin.id}`
		);

		const admin = (socket as any).admin;
		if (!admin || !admin.id) {
			socket.emit("error", { message: "User authentication failed" });
			socket.disconnect();
			return;
		}
		const adminId: string = admin.id;

		socket.join(`admin:${adminId}`);

		socket.on("disconnect", () => {
			console.log(`User ${socket.id} disconnected from /admin-dashboard`);
		});

		// Emit initial data on connection
    const initialData = await VideoRepository.getInitialData();
    socket.emit(EventName.ADMIN_DASHBOARD_INITIAL_DATA, initialData);
	});

	eventEmitter.on(EventName.NEW_VIDEO_UPLOAD, (videoData) => {
		console.log("emitting new video data: ", videoData); // Fixed typo
		namespace.emit(EventName.NEW_VIDEO_UPLOAD, { data: videoData });
	});

	eventEmitter.on(EventName.ONGOING_LIVE_STREAM, (userData) => {
		console.log("emitting ongoing live stream data: ", userData);
		namespace.emit(EventName.ONGOING_LIVE_STREAM, { data: userData });
	});

	// Video processing events
	eventEmitter.on(EventName.VIDEO_TRANSCODE, (data) => {
		namespace.emit(EventName.VIDEO_TRANSCODE, data);
	});

	eventEmitter.on(EventName.VIDEO_PROCESSED, (data) => {
		namespace.emit(EventName.VIDEO_PROCESSED, data);
	});

	eventEmitter.on(EventName.TRANSCRIPTION, (data) => {
		namespace.emit(EventName.TRANSCRIPTION, data);
	});

	eventEmitter.on(EventName.TITLE_SUMMARY, (data) => {
		namespace.emit(EventName.TITLE_SUMMARY, data);
	});

	eventEmitter.on(EventName.THUMBNAIL, (data) => {
		namespace.emit(EventName.THUMBNAIL, data);
	});
};
