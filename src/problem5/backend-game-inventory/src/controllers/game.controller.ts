import { Response } from "express";
// Services
import { GameService } from "@/services/game.service";
// Types
import {
    CreateGameBody,
    GetAllGamesQuery,
    GetGameByIdParams,
    UpdateGameBody,
    UpdateGameParams,
    DeleteGameParams
} from "@/validation/game.validation";
import { ValidatedRequest } from "@/types/validated-request";
import { errorResponse, successResponse } from "@/utils/response";

export class GameController {
    static create = async (
        req: ValidatedRequest<CreateGameBody>,
        res: Response
    ) => {
        const game = await GameService.create(req.validated.body);
        return successResponse(res, game);
    };

    static getAll = async (
        req: ValidatedRequest<unknown, GetAllGamesQuery>,
        res: Response
    ) => {
        const result = await GameService.findAll(req.validated.query);

        return successResponse(res, result.data, {
            total: result.total,
            page: Number(req.validated.query.page) || 1,
            limit: Number(req.validated.query.limit) || 10,
        });
    };

    static getById = async (
        req: ValidatedRequest<unknown, unknown, GetGameByIdParams>,
        res: Response
    ) => {
        const { id } = req.validated.params;
        const game = await GameService.findById(id);
        if (!game) {
            return errorResponse(res, "Game not found", 404);
        }
        successResponse(res, game);
    };

    static update = async (
        req: ValidatedRequest<UpdateGameBody, unknown, UpdateGameParams>,
        res: Response
    ) => {
        const { id } = req.validated.params;
        const game = await GameService.update(id, req.validated.body);
        successResponse(res, game);
    };

    static delete = async (req: ValidatedRequest<unknown, unknown, DeleteGameParams>, res: Response) => {
        const { id } = req.validated.params;
        await GameService.delete(id);
        successResponse(res, { message: "Deleted" });
    };
}