import express from 'express';
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController';
import { createResourceValidator, updateResourceValidator } from '../middleware/validate';


const router = express.Router();

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
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Validation error
 */
router.post('/', createResourceValidator, createResource);

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: List resources with optional filters
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by resource name (partial match)
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *         description: Filter by minimum value
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *         description: Filter by maximum value
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
router.get('/', listResources);

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
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 */
router.get('/:id', getResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Resource not found
 */
router.put('/:id', updateResourceValidator, updateResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 */
router.delete('/:id', deleteResource);

export default router;