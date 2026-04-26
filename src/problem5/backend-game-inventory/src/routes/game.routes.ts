import { Router } from "express";
import { GameController } from "@/controllers/game.controller";
import { validate } from "@/middleware/validate";
import {
  createGameSchema,
  getAllGamesSchema,
  getGameByIdSchema,
  updateGameSchema,
  deleteGameSchema,
} from "@/validation/game.validation";
import { handler } from "@/utils/handler";

const router = Router();

router.post("/", validate(createGameSchema), handler(GameController.create));

router.get("/", validate(getAllGamesSchema), handler(GameController.getAll));

router.get("/:id", validate(getGameByIdSchema), handler(GameController.getById));

router.put("/:id", validate(updateGameSchema), handler(GameController.update));

router.delete("/:id", validate(deleteGameSchema), handler(GameController.delete));

export default router;