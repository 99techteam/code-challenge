import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Resource } from "../entities/resource";
import { Repository } from "typeorm";
import { validate as isUUID } from "uuid";

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: API for managing resources
 */


const resourceRepository: Repository<Resource> = AppDataSource.getRepository(Resource);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the resource
 *               description:
 *                 type: string
 *                 description: A brief description of the resource
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 */
export const createResource = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  try {
    const newResource = resourceRepository.create({ name, description });
    await resourceRepository.save(newResource);
    res.status(201).json(newResource);
  } catch (error) {

    console.log("🚀 Andrew ~ createResource ~ error:", error)

    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       500:
 *         description: Internal Server Error
 */
export const listResources = async (_req: Request, res: Response): Promise<void> => {
  try {
    const resources = await resourceRepository.find();
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The resource UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal Server Error
 */
export const getResource = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  
  // Validate UUID format
  if (!isUUID(id)) {
    res.status(400).json({ error: "Invalid UUID format" });
    return;
  }

  try {
    const resource = await resourceRepository.findOneBy({ id });
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The resource UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal Server Error
 */
export const updateResource = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const { name, description } = req.body;

  // Validate UUID format
  if (!isUUID(id)) {
    res.status(400).json({ error: "Invalid UUID format" });
    return;
  }

  try {
    let resource = await resourceRepository.findOneBy({ id });
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    resource.name = name;
    resource.description = description;
    await resourceRepository.save(resource);

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The resource UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal Server Error
 */
export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  
  // Validate UUID format
  if (!isUUID(id)) {
    res.status(400).json({ error: "Invalid UUID format" });
    return;
  }

  try {
    const resource = await resourceRepository.findOneBy({ id });
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    await resourceRepository.remove(resource);
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
