import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { Resource } from '../entities/Resource.entity';
import { AppDataSource } from '../database/typeorm.config';
import { CreateResourceDto, UpdateResourceDto } from '../dto';
import { ResourceFilters } from '../types';
import { logDatabase } from '../utils/logger';

export class ResourceService {
  private resourceRepository: Repository<Resource>;

  constructor() {
    // Repository will be initialized lazily when first used
    this.resourceRepository = AppDataSource.getRepository(Resource);
  }

  // Create a new resource
  async create(data: CreateResourceDto): Promise<Resource> {
    logDatabase('Creating new resource', { 
      operation: 'CREATE',
      data: { name: data.name, category: data.category, isActive: data.isActive }
    });

    // Create resource instance
    const resource = this.resourceRepository.create({
      name: data.name,
      description: data.description,
      category: data.category,
      isActive: data.isActive !== undefined ? data.isActive : true
    });

    // Save to database
    const savedResource = await this.resourceRepository.save(resource);
    
    logDatabase('Resource created successfully', { 
      resourceId: savedResource.id,
      resourceName: savedResource.name
    });

    return savedResource;
  }

  // Find resource by ID
  async findById(id: number): Promise<Resource | null> {
    logDatabase('Finding resource by ID', { 
      operation: 'FIND_BY_ID',
      resourceId: id
    });

    const resource = await this.resourceRepository.findOne({
      where: { id }
    });

    logDatabase('Find by ID query executed', { 
      resourceId: id,
      found: !!resource
    });

    return resource;
  }

  // Find all resources with filtering and pagination
  async findAll(filters: ResourceFilters = {}): Promise<{ resources: Resource[]; total: number }> {
    logDatabase('Finding all resources with filters', { 
      operation: 'FIND_ALL',
      filters
    });

    // Build query builder for complex filtering
    let queryBuilder: SelectQueryBuilder<Resource> = this.resourceRepository
      .createQueryBuilder('resource');

    // Apply filters
    if (filters.name) {
      queryBuilder = queryBuilder.andWhere('resource.name LIKE :name', { 
        name: `%${filters.name}%` 
      });
    }

    if (filters.category) {
      queryBuilder = queryBuilder.andWhere('resource.category = :category', { 
        category: filters.category 
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder = queryBuilder.andWhere('resource.isActive = :isActive', { 
        isActive: filters.isActive 
      });
    }

    // Add ordering
    queryBuilder = queryBuilder.orderBy('resource.createdAt', 'DESC');

    // Get total count (before pagination)
    const total = await queryBuilder.getCount();

    logDatabase('Count query executed', { total });

    // Apply pagination
    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder = queryBuilder.offset(filters.offset);
    }

    // Execute query
    const resources = await queryBuilder.getMany();

    logDatabase('Find all query executed', { 
      totalResources: total,
      returnedCount: resources.length,
      filters
    });

    return { resources, total };
  }

  // Update a resource
  async update(id: number, data: UpdateResourceDto): Promise<Resource | null> {
    logDatabase('Updating resource', { 
      operation: 'UPDATE',
      resourceId: id,
      updateData: Object.keys(data)
    });

    // Check if resource exists
    const existingResource = await this.findById(id);
    if (!existingResource) {
      logDatabase('Update failed: resource not found', { resourceId: id });
      return null;
    }

    // Update fields
    const updateData: Partial<Resource> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Perform update
    await this.resourceRepository.update(id, updateData);

    // Return updated resource
    const updatedResource = await this.findById(id);
    
    logDatabase('Resource updated successfully', { 
      resourceId: id,
      updatedFields: Object.keys(updateData).length
    });

    return updatedResource;
  }

  // Delete a resource
  async delete(id: number): Promise<boolean> {
    logDatabase('Deleting resource', { 
      operation: 'DELETE',
      resourceId: id
    });

    const result = await this.resourceRepository.delete(id);
    const affectedRows = result.affected ?? 0;
    const deleted = affectedRows > 0;

    logDatabase('Delete query executed', { 
      resourceId: id,
      affectedRows,
      deleted
    });

    return deleted;
  }

  // Get distinct categories
  async getCategories(): Promise<string[]> {
    logDatabase('Getting distinct categories', { 
      operation: 'GET_CATEGORIES'
    });

    const result = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('DISTINCT resource.category', 'category')
      .where('resource.category IS NOT NULL')
      .andWhere('resource.category != ""')
      .orderBy('resource.category', 'ASC')
      .getRawMany();

    const categories = result
      .map(row => row.category as string)
      .filter(category => category && category.trim() !== '');

    logDatabase('Categories query executed', { 
      categoriesFound: categories.length,
      categories
    });

    return categories;
  }

  // Seed database with sample data
  async seedData(): Promise<void> {
    try {
      const existingCount = await this.resourceRepository.count();
      
      if (existingCount === 0) {
        logDatabase('Seeding database with sample data');
        
        const sampleResources = [
          {
            name: 'Sample Laptop',
            description: 'High-performance laptop for development',
            category: 'electronics',
            isActive: true
          },
          {
            name: 'TypeScript Guide',
            description: 'Comprehensive guide to TypeScript programming',
            category: 'books',
            isActive: true
          },
          {
            name: 'Office Chair',
            description: 'Ergonomic office chair for comfortable work',
            category: 'furniture',
            isActive: false
          },
          {
            name: 'Monitor Stand',
            description: 'Adjustable monitor stand for better ergonomics',
            category: 'accessories',
            isActive: true
          }
        ];

        const resources = this.resourceRepository.create(sampleResources);
        await this.resourceRepository.save(resources);
        
        logDatabase('Database seeded successfully', { 
          resourcesCreated: sampleResources.length 
        });
      } else {
        logDatabase('Database already contains data, skipping seed', { 
          existingCount 
        });
      }
    } catch (error) {
      throw error; // Let the caller handle logging
    }
  }
} 