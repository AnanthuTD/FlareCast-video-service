import EventName from "@/domain/enums/eventNames";
import { LocalEventEmitter } from "@/infra/providers/LocalEventEmitter";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { Namespace, Socket } from "socket.io";
import { authenticateWebsocketAdmin } from "../middleware/socketAuth.middleware";

export const setupAdminDashboardNamespace = (namespace: Namespace) => {
	namespace.use(authenticateWebsocketAdmin);

	namespace.on("connection", async (socket: Socket) => {
		console.log(
			`🟢 Admin ${socket.admin.id} connected to /admin-dashboard: socketId: ${socket.id}`
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
		const videoRepository = new VideoRepository();
		const initialData = await videoRepository.fetchAdminDashboardState();
		let videoStatusCount = null;

		try {
			videoStatusCount = await videoRepository.statusCount();
		} catch (err) {
			console.error(err);
		}

		// socket.emit(EventName.ADMIN_DASHBOARD_INITIAL_DATA, "hello")

		socket.emit(
			EventName.ADMIN_DASHBOARD_INITIAL_DATA,
			initialData,
			videoStatusCount?.[0]
		);
	});

	namespace.on(EventName.ADMIN_DASHBOARD_INITIAL_DATA, async (socket) => {
		const videoRepository = new VideoRepository();
		const initialData = await videoRepository.fetchAdminDashboardState();
		let videoStatusCount = null;

		try {
			videoStatusCount = await videoRepository.statusCount();
		} catch (err) {
			console.error(err);
		}

		// socket.emit(EventName.ADMIN_DASHBOARD_INITIAL_DATA, "hello")

		socket.emit(
			EventName.ADMIN_DASHBOARD_INITIAL_DATA,
			initialData,
			videoStatusCount?.[0]
		);
	});

	const eventEmitter = new LocalEventEmitter();

	eventEmitter.on(EventName.NEW_VIDEO_UPLOAD, (videoData) => {
		console.log("emitting new video data: ", videoData);
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
