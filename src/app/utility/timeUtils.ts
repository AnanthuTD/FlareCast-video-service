export function getTimeAgo(createdAt: Date): string {
	const diff = new Date().getTime() - createdAt.getTime();
	const seconds = Math.round(Math.floor(diff / 1000));
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days}d`;
	} else if (hours > 0) {
		return `${hours}h`;
	} else if (minutes > 0) {
		return `${minutes}m`;
	} else {
		return `${seconds}s`;
	}
}

export function getVideoDurationFormatted(durationInSeconds: string): string {
	const duration = parseFloat(durationInSeconds);
	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds = Math.round(duration % 60);

	return `${hours > 0 ? `${hours}h ` : ""}${
		minutes > 0 ? `${minutes}m` : ""
	} ${seconds}s`;
}
