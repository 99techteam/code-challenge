import { autoInjectable } from "tsyringe";
import UserRepository from "../repositories/user.repository";
import { CreateUserDto, GetParamsUsersDto, UpdateUserDto, UserDto } from "../dtos/user.dto";
import { validateDto } from "../helpers/utils";
import {  BadRequestError, NotFoundError } from "../core/ApiError";
import { User } from "../database/entities/User";
import { plainToInstance } from 'class-transformer';
import { IResultGetAll } from "../constants/resultGetAll";
import { SortBy } from "../enums/SortBy";
import { DEFAULT_LENGTH_LIMIT } from "../constants";

@autoInjectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async getById(id: string): Promise<UserDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.gender',
        'user.email',
        'user.createdBy',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where({ id })
      .getOne();

    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`
      );
    }

    return plainToInstance(UserDto, user);
  }

  async getAll(
    params: GetParamsUsersDto,
  ): Promise<IResultGetAll<UserDto[]>> {
    await validateDto(params);

    const { sortBy, search, limit, offset } = params;

    const query = this.userRepository
      .createQueryBuilder("user")
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.gender',
        'user.email',
      ]);

    if (search) {
      query.where("CONCAT(user.firstName, ' ', user.lastName) LIKE :search", {
        search: `%${search}%`,
      });
    }

    const [result, total] = await query
      .orderBy('user.firstName', sortBy === SortBy.ascending ? 'ASC' : 'DESC')
      .take(limit || DEFAULT_LENGTH_LIMIT)
      .skip(offset || 0)
      .getManyAndCount();

    const getUserDtos = plainToInstance(UserDto, result);

    return {
      data: getUserDtos,
      total,
    };
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    await validateDto(createUserDto);

    const existingUserByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUserByEmail) {
      throw new NotFoundError(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const user = this.userRepository.create({
      ...createUserDto,
    })

    const userCreated = await this.userRepository.save(user);

    return plainToInstance(
      UserDto,
      userCreated
    )
  }

  async updateById(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDto | null> {
    await validateDto(updateUserDto);

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new BadRequestError(
        `User with id ${id} not found`
      );
    }

    const updateResult = await this.userRepository.update(
      user.id,
      updateUserDto,
    )

    if (updateResult.affected && updateResult.affected > 0) {
      const updatedUser = await this.userRepository.findOneBy({ id });

      if (!updatedUser) {
        throw new BadRequestError(
          `No user found with id ${id} after update`,
        );
      }

      return plainToInstance(
        UserDto,
        updatedUser
      );
    }

    throw new BadRequestError(
      `Failed to update user with id ${id}`,
    );
  }

  async deleteById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id
    });
    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`
      );
    }
    await this.userRepository.delete(user.id);
    return user;
  }
}