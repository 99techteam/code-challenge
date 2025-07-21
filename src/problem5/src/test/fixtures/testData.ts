// Test data fixtures for e2e tests
export const validResourceData = {
  name: 'Test Resource',
  description: 'This is a test resource for e2e testing',
  category: 'Testing',
  isActive: true
};

export const minimalResourceData = {
  name: 'Minimal Resource',
  description: 'Minimal test resource'
};

export const updateResourceData = {
  name: 'Updated Test Resource',
  description: 'This resource has been updated',
  category: 'Updated',
  isActive: false
};

export const invalidResourceData = {
  // Missing required fields
  incomplete: {
    name: 'Incomplete Resource'
  },
  // Invalid data types
  invalidTypes: {
    name: 123,
    description: 'Valid description',
    isActive: 'invalid'
  },
  // Empty required fields
  emptyName: {
    name: '',
    description: 'Valid description'
  }
};

export const multipleResourcesData = [
  {
    name: 'Resource Alpha',
    description: 'First test resource',
    category: 'Category A',
    isActive: true
  },
  {
    name: 'Resource Beta',
    description: 'Second test resource',
    category: 'Category B',
    isActive: false
  },
  {
    name: 'Resource Gamma',
    description: 'Third test resource',
    category: 'Category A',
    isActive: true
  },
  {
    name: 'Search Test Resource',
    description: 'Resource for search testing',
    category: 'Search',
    isActive: true
  }
];

// Helper functions
export const createMockResource = (overrides = {}) => ({
  ...validResourceData,
  ...overrides
});

export const expectResourceStructure = (resource: any) => {
  expect(resource).toEqual(expect.objectContaining({
    id: expect.any(Number),
    name: expect.any(String),
    description: expect.any(String),
    isActive: expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
  }));
}; 