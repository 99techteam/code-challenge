import { autoInjectable } from "tsyringe";
import { UserService } from "../services/user.service";
import { NextFunction, Request, Response } from "express";
import { CreateUserDto, GetParamsUsersDto, UpdateUserDto, UserDto } from "../dtos/user.dto";
import { SuccessResponse, SuccessResponseWithTotal } from "../core/ApiResponse";
import { plainToInstance } from "class-transformer";
import { User } from '../database/entities/User';


@autoInjectable()
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const userId: string = req.params.id;

    try {
      const users: UserDto = await this.userService.getById(userId);

      res.json(new SuccessResponse<UserDto>(users));
    } catch (error) {
      next(error);
    }
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const { limit, offset, ...rest } = req.query;
    const getParamsUsersDto: GetParamsUsersDto = plainToInstance(
      GetParamsUsersDto,
      {
        ...rest,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      }
    );

    try {
      const { data, total } = await this.userService.getAll(getParamsUsersDto);

      return res.json(
        new SuccessResponseWithTotal<UserDto[]>(data, total)
      );
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const createUserData: CreateUserDto = plainToInstance(
      CreateUserDto,
      req.body
    );

    try {
      const result = await this.userService.create(createUserData);

      return res.json(
        new SuccessResponse<UserDto>(result),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const userId = req.params.id;
    const userData: UpdateUserDto = plainToInstance(UpdateUserDto, req.body);

    try {
      const users = await this.userService.updateById(
        userId,
        userData,
      );

      return res.json(
        new SuccessResponse<
          UserDto | null
        >(users),
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const userId = req.params.id;

    try {
      const users = await this.userService.deleteById(userId);

      return res.json(new SuccessResponse<User>(users));
    } catch (error) {
      next(error);
    }
  }
}