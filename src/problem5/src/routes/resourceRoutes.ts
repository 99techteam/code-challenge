import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { 
  validateCreateResource, 
  validateUpdateResource, 
  validateQueryResource, 
  validateResourceId 
} from '../middleware/validation';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const resourceController = new ResourceController();

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources with optional filtering
 *     description: |
 *       Retrieves a paginated list of resources with optional filtering capabilities.
 *       This endpoint uses the GetAllResourcesQuery in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → GetAllResourcesQuery → GetAllResourcesQueryHandler → ResourceModel
 *     tags: [Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/NameFilter'
 *       - $ref: '#/components/parameters/CategoryFilter' 
 *       - $ref: '#/components/parameters/IsActiveFilter'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Offset'
 *     responses:
 *       200:
 *         description: Successfully retrieved resources
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceListResponse'
 *             example:
 *               success: true
 *               data:
 *                 data:
 *                   - id: 1
 *                     name: "Sample Resource 1"
 *                     description: "This is a sample resource"
 *                     category: "Testing"
 *                     isActive: true
 *                     createdAt: "2023-12-01T10:00:00.000Z"
 *                     updatedAt: "2023-12-01T10:00:00.000Z"
 *                 total: 1
 *                 limit: 10
 *                 offset: 0
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', validateQueryResource, asyncHandler(resourceController.getAll));

/**
 * @swagger
 * /api/resources/categories:
 *   get:
 *     summary: Get all available resource categories
 *     description: |
 *       Retrieves a list of all distinct categories used by resources.
 *       This endpoint uses the GetCategoriesQuery in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → GetCategoriesQuery → GetCategoriesQueryHandler → ResourceModel
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: string
 *             example:
 *               success: true
 *               data: ["Development", "Testing", "Production", "Demo"]
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/categories', asyncHandler(resourceController.getCategories));

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a specific resource by ID
 *     description: |
 *       Retrieves a single resource by its unique identifier.
 *       This endpoint uses the GetResourceByIdQuery in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → GetResourceByIdQuery → GetResourceByIdQueryHandler → ResourceModel
 *     tags: [Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/ResourceId'
 *     responses:
 *       200:
 *         description: Successfully retrieved resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Sample Resource"
 *                 description: "This is a sample resource"
 *                 category: "Testing"
 *                 isActive: true
 *                 createdAt: "2023-12-01T10:00:00.000Z"
 *                 updatedAt: "2023-12-01T10:00:00.000Z"
 *       400:
 *         description: Invalid resource ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid resource ID. ID must be a positive integer."
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', validateResourceId, asyncHandler(resourceController.getById));

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource
 *     description: |
 *       Creates a new resource with the provided data.
 *       This endpoint uses the CreateResourceCommand in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → CreateResourceCommand → CreateResourceCommandHandler → ResourceModel
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceDto'
 *           examples:
 *             basic:
 *               summary: Basic resource creation
 *               value:
 *                 name: "New Resource"
 *                 description: "A comprehensive description of the new resource"
 *                 category: "Development"
 *                 isActive: true
 *             minimal:
 *               summary: Minimal required fields
 *               value:
 *                 name: "Minimal Resource"
 *                 description: "Only required fields provided"
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *             example:
 *               success: true
 *               message: "Resource created successfully"
 *               data:
 *                 id: 2
 *                 name: "New Resource"
 *                 description: "A comprehensive description of the new resource"
 *                 category: "Development"
 *                 isActive: true
 *                 createdAt: "2023-12-01T10:30:00.000Z"
 *                 updatedAt: "2023-12-01T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', validateCreateResource, asyncHandler(resourceController.create));

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource (full update)
 *     description: |
 *       Updates a resource with the provided data. All updatable fields should be provided.
 *       This endpoint uses the UpdateResourceCommand in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → UpdateResourceCommand → UpdateResourceCommandHandler → ResourceModel
 *     tags: [Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/ResourceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResourceDto'
 *           example:
 *             name: "Updated Resource Name"
 *             description: "Updated comprehensive description"
 *             category: "Updated Category"
 *             isActive: false
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *             example:
 *               success: true
 *               message: "Resource updated successfully"
 *               data:
 *                 id: 1
 *                 name: "Updated Resource Name"
 *                 description: "Updated comprehensive description"
 *                 category: "Updated Category"
 *                 isActive: false
 *                 createdAt: "2023-12-01T10:00:00.000Z"
 *                 updatedAt: "2023-12-01T11:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', validateResourceId, validateUpdateResource, asyncHandler(resourceController.update));

/**
 * @swagger
 * /api/resources/{id}:
 *   patch:
 *     summary: Update a resource (partial update)
 *     description: |
 *       Partially updates a resource with the provided data. Only provided fields will be updated.
 *       This endpoint uses the UpdateResourceCommand in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → UpdateResourceCommand → UpdateResourceCommandHandler → ResourceModel
 *     tags: [Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/ResourceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResourceDto'
 *           examples:
 *             statusOnly:
 *               summary: Update only status
 *               value:
 *                 isActive: false
 *             nameAndCategory:
 *               summary: Update name and category
 *               value:
 *                 name: "Partially Updated Resource"
 *                 category: "New Category"
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *             example:
 *               success: true
 *               message: "Resource updated successfully"
 *               data:
 *                 id: 1
 *                 name: "Partially Updated Resource"
 *                 description: "Original description remains"
 *                 category: "New Category"
 *                 isActive: false
 *                 createdAt: "2023-12-01T10:00:00.000Z"
 *                 updatedAt: "2023-12-01T11:15:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id', validateResourceId, validateUpdateResource, resourceController.update);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     description: |
 *       Permanently deletes a resource by its unique identifier.
 *       This endpoint uses the DeleteResourceCommand in the CQRS pattern.
 *       
 *       **CQRS Flow**: Controller → DeleteResourceCommand → DeleteResourceCommandHandler → ResourceModel
 *     tags: [Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/ResourceId'
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted:
 *                           type: boolean
 *             example:
 *               success: true
 *               message: "Resource deleted successfully"
 *               data:
 *                 deleted: true
 *       400:
 *         description: Invalid resource ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid resource ID. ID must be a positive integer."
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', validateResourceId, asyncHandler(resourceController.delete));

export default router; 