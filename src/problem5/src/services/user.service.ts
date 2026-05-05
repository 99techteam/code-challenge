import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

const repo = AppDataSource.getRepository(User);

export const createUser = async (data: Partial<User>) => {
  try {
    const user = repo.create(data);
    return await repo.save(user);
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw {
        status: 400,
        message: "Email already exists",
      };
    }

    throw err;
  }
};

export const getUsers = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const qb = repo.createQueryBuilder("user");

  if (query.name) {
    qb.andWhere("user.name LIKE :name", {
      name: `%${query.name}%`,
    });
  }

  if (query.minAge) {
    qb.andWhere("user.age >= :minAge", {
      minAge: Number(query.minAge),
    });
  }

  if (query.maxAge) {
    qb.andWhere("user.age <= :maxAge", {
      maxAge: Number(query.maxAge),
    });
  }

  if (query.sort) {
    const [field, order] = query.sort.split(":");
    qb.orderBy(`user.${field}`, order?.toUpperCase() || "ASC");
  } else {
    qb.orderBy("user.createdAt", "DESC");
  }

  qb.skip((page - 1) * limit).take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: number) => {
  return repo.findOneBy({ id });
};

export const updateUser = async (id: number, data: Partial<User>) => {
  await repo.update(id, data);
  return repo.findOneBy({ id });
};

export const deleteUser = async (id: number) => {
  return repo.delete(id);
};
