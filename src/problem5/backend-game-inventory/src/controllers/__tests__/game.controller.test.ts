import { GameController } from "../game.controller";
import { GameService } from "../../services/game.service";

describe("GameController", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create game", async () => {
    const req: any = {
      validated: {
        body: { title: "GTA" },
      },
    };

    const res = mockRes();

    jest.spyOn(GameService, "create").mockResolvedValue({ id: "1" } as any);

    await GameController.create(req, res);

    expect(GameService.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should get all games", async () => {
    const req: any = {
      validated: {
        query: { page: 1, limit: 10 },
      },
    };

    const res = mockRes();

    jest
      .spyOn(GameService, "findAll")
      .mockResolvedValue({ data: [], meta: {} } as any);

    await GameController.getAll(req, res);

    expect(GameService.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("should return 404 if not found", async () => {
    const req: any = {
      validated: {
        params: { id: "1" },
      },
    };

    const res = mockRes();

    jest.spyOn(GameService, "findById").mockResolvedValue(null as any);

    await GameController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});