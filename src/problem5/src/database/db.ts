import fs from 'fs';
import path from 'path';
import { Resource, CreateResourceDTO, UpdateResourceDTO, ResourceFilter } from '../types/resource';

const DATA_FILE = path.join(__dirname, '../../data/resources.json');

// Ensure data directory and file exist
const ensureDataFile = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

// Read resources from file
const readResources = (): Resource[] => {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

// Write resources to file
const writeResources = (resources: Resource[]): void => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(resources, null, 2));
};

// Generate unique ID
const generateId = (): string => {
  return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

class Database {
  // Get all resources with optional filters
  getAllResources(filters?: ResourceFilter): Resource[] {
    let resources = readResources();

    if (filters) {
      if (filters.type) {
        resources = resources.filter(r => r.type === filters.type);
      }
      if (filters.status) {
        resources = resources.filter(r => r.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        resources = resources.filter(r =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return resources;
  }

  // Get resource by ID
  getResourceById(id: string): Resource | null {
    const resources = readResources();
    return resources.find(r => r.id === id) || null;
  }

  // Create new resource
  createResource(data: CreateResourceDTO): Resource {
    const resources = readResources();
    
    const newResource: Resource = {
      id: generateId(),
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    resources.push(newResource);
    writeResources(resources);

    return newResource;
  }

  // Update resource
  updateResource(id: string, data: UpdateResourceDTO): Resource | null {
    const resources = readResources();
    const index = resources.findIndex(r => r.id === id);

    if (index === -1) {
      return null;
    }

    const updatedResource: Resource = {
      ...resources[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    resources[index] = updatedResource;
    writeResources(resources);

    return updatedResource;
  }

  // Delete resource
  deleteResource(id: string): boolean {
    const resources = readResources();
    const filteredResources = resources.filter(r => r.id !== id);

    if (filteredResources.length === resources.length) {
      return false; // Resource not found
    }

    writeResources(filteredResources);
    return true;
  }

  // Check if resource exists
  resourceExists(id: string): boolean {
    return this.getResourceById(id) !== null;
  }
}

export default new Database();
