import { UserServiceImpl } from '../../ports/primary/user.service-impl';
import { User, UserFilter } from '../../domain/dto/user.dto';
import { UserRepository } from '../../domain/repositories/user.repository';


class MockUserRepository implements UserRepository {
	private users: User[] = [];
	private idCounter = 1;

	async create(user: Omit<User, 'id'>): Promise<User> {
		const newUser: User = { id: String(this.idCounter++), ...user };
		this.users.push(newUser);
		return newUser;
	}

	async list(filter?: UserFilter): Promise<User[]> {
		if (!filter) return [...this.users];
		return this.users.filter(u => {
			return (!filter.name || u.name === filter.name) && (!filter.email || u.email === filter.email);
		});
	}

	async get(id: string): Promise<User | null> {
		return this.users.find(u => u.id === id) || null;
	}

	async update(id: string, user: Partial<Omit<User, 'id'>>): Promise<User | null> {
		const idx = this.users.findIndex(u => u.id === id);
		if (idx === -1) return null;
		this.users[idx] = { ...this.users[idx], ...user };
		return this.users[idx];
	}

	async delete(id: string): Promise<boolean> {
		const idx = this.users.findIndex(u => u.id === id);
		if (idx === -1) return false;
		this.users.splice(idx, 1);
		return true;
	}
}

describe('UserService (with mock repository)', () => {
	let userService: UserServiceImpl;
	let createdUser: User;
	const testUser = { name: 'Test User', email: 'testuser@example.com' };

	beforeAll(() => {
		userService = new UserServiceImpl(new MockUserRepository());
	});

	it('should create a user', async () => {
		createdUser = await userService.createUser(testUser);
		expect(createdUser).toHaveProperty('id');
		expect(createdUser.name).toBe(testUser.name);
		expect(createdUser.email).toBe(testUser.email);
	});

	it('should list users', async () => {
		const users = await userService.listBy();
		expect(Array.isArray(users)).toBe(true);
		expect(users.length).toBeGreaterThan(0);
	});

	it('should get user details', async () => {
		const user = await userService.getUser(createdUser.id);
		expect(user).not.toBeNull();
		expect(user?.id).toBe(createdUser.id);
	});

	it('should update user details', async () => {
		const updated = await userService.updateUser(createdUser.id, { name: 'Updated User' });
		expect(updated).not.toBeNull();
		expect(updated?.name).toBe('Updated User');
	});

	it('should delete a user', async () => {
		const result = await userService.deleteUser(createdUser.id);
		expect(result).toBe(true);
		const user = await userService.getUser(createdUser.id);
		expect(user).toBeNull();
	});
});
