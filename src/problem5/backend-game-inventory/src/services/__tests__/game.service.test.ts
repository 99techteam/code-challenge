import { GameService } from "../game.service";
import { Game } from "../../models/game.model";

jest.mock("../../models/game.model", () => ({
  Game: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("GameService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a game", async () => {
    const mockData = { title: "GTA", genre: "Action" };

    (Game.create as jest.Mock).mockResolvedValue(mockData);

    const result = await GameService.create(mockData as any);

    expect(Game.create).toHaveBeenCalledWith(mockData);
    expect(result).toEqual(mockData);
  });

  it("should return paginated games", async () => {
    const mockGames = [{ id: "1", title: "GTA" }];

    // mock chain: find().skip().limit()
    const mockQuery = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockGames),
    };

    (Game.find as jest.Mock).mockReturnValue(mockQuery);
    (Game.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await GameService.findAll({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockGames);
    expect(result.total).toBe(1);
  });

  it("should find by id", async () => {
    const mockGame = { id: "1" };

    (Game.findById as jest.Mock).mockResolvedValue(mockGame);

    const result = await GameService.findById("1");

    expect(result).toEqual(mockGame);
  });

  it("should update a game", async () => {
    const updated = { id: "1", title: "Updated" };

    (Game.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await GameService.update("1", { title: "Updated" });

    expect(result).toEqual(updated);
  });

  it("should delete a game", async () => {
    (Game.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    const result = await GameService.delete("1");

    expect(result).toEqual({});
  });
});