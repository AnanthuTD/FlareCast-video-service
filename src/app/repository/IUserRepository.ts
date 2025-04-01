export interface IUserRepository {
	findById(id: string): Promise<any>;
	create(user: any): Promise<any>;
}
