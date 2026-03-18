import { User, UserFilter } from "../../domain/dto/user.dto";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserService } from "../../domain/services/user.service";
import { userRepository } from "../secondary/database/user.repository-impl";

class UserServiceImpl implements UserService {
    private readonly repository: UserRepository;
    private static instance: UserServiceImpl;

    public constructor(repository: UserRepository) {
        this.repository = repository;
    }

    // Make sure the instance is created only once and shared across the application (dependency injection)
    public getInstance(): UserServiceImpl {
        if (!UserServiceImpl.instance) {
            UserServiceImpl.instance = new UserServiceImpl(this.repository);
        }
        return UserServiceImpl.instance;
    }

    async createUser(user: Omit<User, 'id'>): Promise<User> {
        return this.repository.create(user);
    }

    async listBy(filter?: UserFilter): Promise<User[]> {
        if (filter) {
            // Only keep 'name' and 'email' keys in the filter object
            filter = {
                name: filter.name,
                email: filter.email
            };
        }
        return this.repository.list(filter);
    }

    async getUser(id: string | string[]): Promise<User | null> {
        if (Array.isArray(id)) {
            return this.repository.get(id[0]);
        }
        return this.repository.get(id);
    }

    async updateUser(id: string | string[], user: Partial<Omit<User, 'id'>>): Promise<User | null> {
        if (Array.isArray(id)) {
            return this.repository.update(id[0], user);
        }
        return this.repository.update(id, user);
    }

    async deleteUser(id: string | string[]): Promise<boolean> {
        if (Array.isArray(id)) {
            return this.repository.delete(id[0]);
        }
        return this.repository.delete(id);
    }
}

const userService = new UserServiceImpl(userRepository).getInstance();

export { userService, UserServiceImpl };