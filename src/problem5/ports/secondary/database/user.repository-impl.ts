import { User, UserFilter } from "../../../domain/dto/user.dto";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { databaseConnection } from "./database";

class UserRepositoryImpl implements UserRepository {
    private static instance: UserRepositoryImpl;

    public getInstance(): UserRepositoryImpl {
        if (!UserRepositoryImpl.instance) {
            UserRepositoryImpl.instance = new UserRepositoryImpl();
        }
        return UserRepositoryImpl.instance;
    }

    async create(user: Omit<User, 'id'>): Promise<User> {
        const db = await databaseConnection.getDatabase()
        const id = crypto.randomUUID();
        // Use ? for value to prevent SQL injection
        await db.run(
            'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
            [id, user.name, user.email]
        );
        return { id, ...user };
    }

    async list(filter?: UserFilter): Promise<User[]> {
        const db = await databaseConnection.getDatabase()
        let query = 'SELECT * FROM users';
        const params: any[] = [];
        if (filter) {
            const conditions: string[] = [];
            if (filter.name) {
                conditions.push('name LIKE ?');
                params.push(`%${filter.name}%`);
            }
            if (filter.email) {
                conditions.push('email LIKE ?');
                params.push(`%${filter.email}%`);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
        }
        return await db.all(query, params);
    }

    async get(id: string): Promise<User | null> {
        const db = await databaseConnection.getDatabase()
        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        return user || null;
    }

    async update(id: string, user: Partial<Omit<User, 'id'>>): Promise<User | null> {
        const db = await databaseConnection.getDatabase()
        const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!existingUser) return null;
        const updatedUser = { ...existingUser, ...user };
        await db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [updatedUser.name, updatedUser.email, id]
        );
        return updatedUser;
    }

    async delete(id: string): Promise<boolean> {
        const db = await databaseConnection.getDatabase()
        const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
        return typeof result?.changes === "number" && result.changes > 0;
    }
}

const userRepository = new UserRepositoryImpl().getInstance();

export { userRepository };
