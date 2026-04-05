import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';

const resourceService = new ResourceService();

export class ResourceController {
  async createResource(req: Request, res: Response) {
    try {
      const resource = await resourceService.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(500).json({ message: 'Error creating resource' });
    }
  }

  async getResources(req: Request, res: Response) {
    try {
      const resources = await resourceService.getResources(req.query);
      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ message: 'Error getting resources' });
    }
  }

  async getResourceById(req: Request, res: Response) {
    try {
      const resource = await resourceService.getResourceById(Number(req.params.id));
      if (resource) {
        res.status(200).json(resource);
      } else {
        res.status(404).json({ message: 'Resource not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error getting resource' });
    }
  }

  async updateResource(req: Request, res: Response) {
    try {
      const resource = await resourceService.updateResource(Number(req.params.id), req.body);
      if (resource) {
        res.status(200).json(resource);
      } else {
        res.status(404).json({ message: 'Resource not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating resource' });
    }
  }

  async deleteResource(req: Request, res: Response) {
    try {
      await resourceService.deleteResource(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting resource' });
    }
  }
}
