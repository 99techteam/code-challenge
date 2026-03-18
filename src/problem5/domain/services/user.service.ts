import { User, UserFilter } from "../dto/user.dto";

export interface UserService {
	createUser(user: Omit<User, 'id'>): Promise<User>;
	listBy(filter?: UserFilter): Promise<User[]>;
	getUser(id: string): Promise<User | null>;
	updateUser(id: string, user: Partial<Omit<User, 'id'>>): Promise<User | null>;
	deleteUser(id: string): Promise<boolean>;
}
