export interface IUserRepository {
	findById(id: string): Promise<any>;
	create(user: any): Promise<any>;
	searchByName(query: string):Promise<{
    id: string;
    fullName: string;
    image: string;
}[]>
}
