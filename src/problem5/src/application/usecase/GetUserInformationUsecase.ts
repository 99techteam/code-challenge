import { User } from "../controller/User";
import * as schema from "../../domain/schema";

export class GetUserInformationUsecase {

  async getAllUsers(
    filters: schema.UserFilters,
    pagination: schema.PaginationOptions
  ): Promise<{
    data: schema.IStoredUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const user = new User();
    const users = await user.getAllUserInformation( filters,pagination);
    return users;
  }

  async getUserById(id: string): Promise<schema.IStoredUser> {
    const user = new User();
    return await user.byId(id);
  }

  async getUserByEmail(email: string): Promise<schema.IStoredUser> {
    const user = new User();
    return await user.byEmail(email);
  }

  async getUserPasswordByEmail(email: string): Promise<schema.IStoredUser> {
    const user = new User();
    return await user.passwordByEmail(email);
  }
}
