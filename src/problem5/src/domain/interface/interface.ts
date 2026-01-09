import * as schema from '../schema';

export interface RepositoryInterface {

  // get all user information
  getAllUsers(
    filters: schema.UserFilters,
    pagination: schema.PaginationOptions
  ): Promise<{ data: schema.IStoredUser[]; total: number }>;

  // get user information by Id
  getUserById(id: string): Promise<schema.IStoredUser>;

  // get user information by email
  getUserByEmail(email: string): Promise<schema.IStoredUser>;

  // get user information by email
  getUserPasswordByEmail(email: string): Promise<schema.IStoredUser>;

  // store the user information
  storeUserData(payload: schema.IUserData): Promise<string | null>;

  // update user information by Id
  updateUserById(
    id: string,
    payload: Partial<schema.IUserData>
  ): Promise<schema.IStoredUser | null>;

  // delete user by Id
  deleteUserById(id: string): Promise<void> ;
}
