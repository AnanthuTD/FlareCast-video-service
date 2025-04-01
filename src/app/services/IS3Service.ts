export interface IS3Service {
	generateUploadUrl(key: string, contentType: string): Promise<string>;
	deleteObjectsByPrefix(prefix: string): Promise<string[]>;
	generatePresignedUrl(key: string, contentType: string): Promise<string>;
}
