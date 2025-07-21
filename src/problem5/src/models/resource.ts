import { ResourceService } from '../services/resource.service';
import { Resource } from '../entities/Resource.entity';
import { CreateResourceDto, UpdateResourceDto } from '../dto';
import { ResourceFilters } from '../types';

// Legacy wrapper for ResourceService to maintain compatibility
// This allows existing CQRS handlers to work without changes
export class ResourceModel {
  private resourceService: ResourceService;

  constructor() {
    this.resourceService = new ResourceService();
  }

  // Create a new resource
  async create(data: CreateResourceDto): Promise<Resource> {
    return this.resourceService.create(data);
  }

  // Find resource by ID
  async findById(id: number): Promise<Resource | null> {
    return this.resourceService.findById(id);
  }

  // Find all resources with optional filters
  async findAll(filters: ResourceFilters = {}): Promise<{ resources: Resource[]; total: number }> {
    return this.resourceService.findAll(filters);
  }

  // Update a resource
  async update(id: number, data: UpdateResourceDto): Promise<Resource | null> {
    return this.resourceService.update(id, data);
  }

  // Delete a resource
  async delete(id: number): Promise<boolean> {
    return this.resourceService.delete(id);
  }

  // Get distinct categories
  async getCategories(): Promise<string[]> {
    return this.resourceService.getCategories();
  }

  // Seed database with sample data
  async seedData(): Promise<void> {
    return this.resourceService.seedData();
  }
} 