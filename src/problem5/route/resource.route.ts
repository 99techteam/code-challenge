import express from "express";
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource,
} from "../controller/resource.controller";
const router = express.Router();

router.post("/", createResource);
router.get("/", listResources);
router.get("/:id", getResource);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
