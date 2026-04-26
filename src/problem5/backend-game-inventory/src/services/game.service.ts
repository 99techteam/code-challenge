import { Game } from "@/models/game.model";
import { NotFoundError } from "@/utils/errors";

export class GameService {
  static async create(data: any) {
    return Game.create(data);
  }

  static async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;

    const filter: any = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      Game.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Game.countDocuments(filter),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
  const game = await Game.findById(id);

  if (!game) {
    throw new NotFoundError("Game not found");
  }

  return game;
}

  static async update(id: string, data: any) {
    const game = await Game.findByIdAndUpdate(id, data, { new: true });

    if (!game) {
      throw new NotFoundError("Game not found");
    }

    return game;
  }

  static async delete(id: string) {
    const game = await Game.findByIdAndDelete(id);

    if (!game) {
      throw new NotFoundError("Game not found");
    }

    return game;
  }
}