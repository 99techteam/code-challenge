import { Router } from "express"
import * as service from "./service"

const router = Router()

/**
 * GET /resource
 * List resources with basic filters.
 */
router.get("/", (req, res) => {
  try {
    const filter = req.query
    const resources = service.getResources(filter)
    res.json(resources)
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve resources" })
  }
})


/**
 * POST /resource
 * Create a resource.
 */
router.post("/", (req, res) => {
  try {
    const newResource = service.createResource(req.body)
    res.status(201).json(newResource)
  } catch (error) {
    res.status(500).json({ error: "Failed to create resource" })
  }
})

/**
 * GET /resource/:id
 * Get a resource by ID.
 */
router.get("/:id", (req, res) => {
  try {
    const resource = service.getResourceById(req.params.id)
    if (resource) {
      res.json(resource)
    } else {
      res.status(404).send("Resource not found")
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve resource" })
  }
})


/**
 * PUT /resource/:id
 * Update a resource by ID.
 */
router.put("/:id", (req, res) => {
  try {
    const updatedResource = service.updateResource(req.params.id, req.body)
    if (updatedResource) {
      res.json(updatedResource)
    } else {
      res.status(404).send("Resource not found")
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update resource" })
  }
})

/**
 * DELETE /resource/:id
 * Delete a resource by ID.
 */
router.delete("/:id", (req, res) => {
  try {
    const wasDeleted = service.deleteResource(req.params.id)
    if (wasDeleted) {
      res.status(204).send()
    } else {
      res.status(404).send("Resource not found")
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resource" })
  }
})

export default router
