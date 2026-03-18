import { User, UserFilter } from "../dto/user.dto";


export interface UserRepository {
	create(user: Omit<User, 'id'>): Promise<User>;
	list(filter?: UserFilter): Promise<User[]>;
	get(id: string): Promise<User | null>;
	update(id: string, user: Partial<Omit<User, 'id'>>): Promise<User | null>;
	delete(id: string): Promise<boolean>;
}
