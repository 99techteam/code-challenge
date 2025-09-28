import { db } from '@src/db';
import { usersTable } from '@src/db/schema';
import { SearchUserRequest } from '@src/models/SearchUser';
import { User } from '@src/models/User';
import { and, eq, ilike } from 'drizzle-orm';

/**
 * Get one user.
 */
async function getOne(id: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).execute();
  if (!user) return null;
  return user;
}

/**
 * Get all users.
 */
async function search(request: SearchUserRequest) {
  const filter =
    request.name || request.email
      ? and(
        ...(request.name ? [ilike(usersTable.name, `%${request.name}%`)] : []),
        ...(request.email ? [ilike(usersTable.email, `%${request.email}%`)] : [])
      )
      : undefined;

  return db.select().from(usersTable).where(filter).execute();
}

/**
 * Add one user.
 */
async function add(user: User) {
  const [newUser] = await db.insert(usersTable).values(user).returning({ id: usersTable.id }).execute();
  return newUser;
}

/**
 * Update a user.
 */
async function update(id: number, user: User) {
  await db.update(usersTable).set(user).where(eq(usersTable.id, id)).execute();
}

/**
 * Delete one user.
 */
async function delete_(id: number) {
  await db.delete(usersTable).where(eq(usersTable.id, id)).execute();
}

export default {
  getOne,
  search,
  add,
  update,
  delete: delete_,
} as const;
