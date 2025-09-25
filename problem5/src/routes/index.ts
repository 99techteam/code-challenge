import { Router } from "express";
import entitiesRoute from "./entity.route";

const router = Router();

router.use("/entities", entitiesRoute);

export default router;