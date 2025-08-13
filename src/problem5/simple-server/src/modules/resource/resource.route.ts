import type { Router } from "express";
import type { Config } from "../../config/config";
import { KyselyClient } from "../../database/client";
import { trace } from "../../middlewares/trace.middleware";
import { validateData } from "../../middlewares/zod.middleware";
import { createResourceSchema } from "./dto/create-resource.dto";
import { findResourceByIdSchema } from "./dto/find-resource-by-id.dto";
import { updateResourceSchema } from "./dto/update-resource.dto";
import { RelationalResourceRepository } from "./repositories/relational.repository";
import { ResourceController } from "./resource.controller";
import { ResourceService } from "./resource.service";
export function createResourceRoute(route: Router, config: Config) {
	// resolve the module dependencies
	const repository = new RelationalResourceRepository(
		KyselyClient.getInstance(config),
	);
	const service = new ResourceService(repository);
	const controller = new ResourceController(service);
	/**
	 * @swagger
	 * definitions:
	 *   Resource:
	 *     properties:
	 *       id:
	 *         type: string
	 *       name:
	 *         type: string
	 *       description:
	 *         type: string
	 *       createdAt:
	 *         type: string
	 *         format: date-time
	 *       updatedAt:
	 *         type: string
	 *         format: date-time
	 *       deletedAt:
	 *         type: string
	 *         format: date-time
	 */

	/**
	 * @openapi
	 * /api/resource/{id}:
	 *   get:
	 *     description: Get resource by id
	 *     tags:
	 *       - Resource
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Resource'
	 *
	 *       404:
	 *         description: Not found
	 */
	route.get(
		"/:id",
		trace(controller.getResource.name, config),
		validateData(findResourceByIdSchema, "params"),
		async (req, res) => controller.getResource(req, res),
	);

	/**
	 * @openapi
	 * /api/resource:
	 *   get:
	 *     description: Get all resources
	 *     tags:
	 *       - Resource
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/definitions/Resource'
	 *
	 *       400:
	 *         description: Bad request
	 *
	 */
	route.get("/", trace(controller.getResources.name, config), (_req, res) =>
		controller.getResources(_req, res),
	);

	/**
	 * @swagger
	 * definitions:
	 *   UpdateResourceDto:
	 *     properties:
	 *       name:
	 *         type: string
	 *       description:
	 *         type: string
	 */

	/**
	 * @openapi
	 * /api/resource/{id}:
	 *   patch:
	 *     description: update resource
	 *     consumes:
	 *       - application/json
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         type: string
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             $ref: '#/definitions/UpdateResourceDto'
	 *
	 *     tags:
	 *       - Resource
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Resource'
	 *
	 *       400:
	 *         description: Bad request
	 *       404:
	 *         description: Not found
	 *
	 */
	route.patch(
		"/:id",
		trace(controller.updateResource.name, config),
		validateData(findResourceByIdSchema, "params"),
		validateData(updateResourceSchema, "body"),
		(req, res) => controller.updateResource(req, res),
	);

	/**
	 * @openapi
	 * /api/resource/{id}:
	 *   post:
	 *     description: restore resource from soft delete
	 *     tags:
	 *       - Resource
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         type: string
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Resource'
	 *
	 *       400:
	 *         description: Bad request
	 *       404:
	 *         description: Not found
	 */
	route.post(
		"/restore/:id",
		trace(controller.restore.name, config),
		validateData(findResourceByIdSchema, "params"),
		(req, res) => controller.restore(req, res),
	);

	/**
	 * @swagger
	 * definitions:
	 *   CreateResourceDto:
	 *     properties:
	 *       name:
	 *         type: string
	 *       description:
	 *         type: string
	 */

	/**
	 * @openapi
	 * /api/resource:
	 *   post:
	 *     description: create resource
	 *     consumes:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             $ref: '#/definitions/CreateResourceDto'
	 *     tags:
	 *       - Resource
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Resource'
	 *
	 *       400:
	 *         description: Bad request
	 */
	route.post(
		"/",
		trace(controller.createResource.name, config),
		validateData(createResourceSchema, "body"),
		(req, res) => controller.createResource(req, res),
	);

	/**
	 * @openapi
	 * /api/resource/{id}:
	 *   delete:
	 *     description: soft delete resource
	 *     tags:
	 *       - Resource
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         type: string
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Resource'
	 *       400:
	 *         description: Bad request
	 *       404:
	 *         description: Not found
	 */
	route.delete(
		"/:id",
		trace(controller.softDelete.name, config),
		validateData(findResourceByIdSchema, "params"),
		(req, res) => controller.softDelete(req, res),
	);
}
