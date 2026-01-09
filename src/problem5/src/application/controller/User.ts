import * as schema from '../../domain/schema';
import { Repository } from '../../domain/interface';
import { AlreadyExistUserError } from './errors/AlreadyExistUserError';

export class User {

  constructor(
  ) { }

  public async getAllUserInformation(
    filters: schema.UserFilters,
    pagination: schema.PaginationOptions
  ): Promise<{
    data: schema.IStoredUser[];
    total: number;
    page: number;
    limit: number;
  }> {

    const result = await Repository.instance.getAllUsers(filters, pagination);

    return {
      data: result.data,
      total: result.total,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10
    };
  }

  public async storeUserInformation(user: schema.IUserData): Promise<schema.IStoredUser | null> {
    const exist = await this.checkUserByEmailExist(user.email);
    if (exist) {
      throw new AlreadyExistUserError(user.email, `Email has already existed.`);
    }
    const userId = await Repository.instance
      .storeUserData(user);
    if (userId != null) {
      return this.byId(userId);
    }
    return null;
  }

  public async updateUserInformation(id: string, user: schema.IUserData): Promise<schema.IStoredUser | null> {
    const exist = await this.byId(id);
    if (!exist) {
      throw new AlreadyExistUserError(id, `This user id does not have on system.`);
    }
    return await Repository.instance
      .updateUserById(id, user);
  }

  public async checkUserByEmailExist(email: string): Promise<boolean> {
    try {
      const user = await this.byEmail(email);
      return !(user && !user.email);
    } catch (e) {
      return false;
    }
  }

  public async byEmail(email: string): Promise<schema.IStoredUser> {
    return await Repository.instance
      .getUserByEmail(email)
      .then(user => user);
  }

  public async passwordByEmail(email: string): Promise<schema.IStoredUser> {
    return await Repository.instance
      .getUserPasswordByEmail(email)
      .then(user => user);
  }

  public async byId(id: string): Promise<schema.IStoredUser> {
    return await Repository.instance.getUserById(id);
  }

  public async deleteUserById(id: string): Promise<void> {
    await Repository.instance.deleteUserById(id);
  }
}
