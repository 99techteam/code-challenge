import { Repository } from "typeorm";
import { User } from "../database/entities/User";
import AppDataSource from "../database";


class UserRepository extends Repository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }
}

export default UserRepository;