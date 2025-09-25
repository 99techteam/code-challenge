import { Router } from "express";
import * as entityCtrl from "../controllers/entities.controller";

const router = Router();

router.get('/', entityCtrl.list);
router.post('/', entityCtrl.create);
router.get('/:id', entityCtrl.get);
router.put('/:id', entityCtrl.update);
router.delete('/:id', entityCtrl.remove);

export default router;
