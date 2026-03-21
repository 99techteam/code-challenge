import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  idParamSchema,
} from '../resource.validation';

describe('createResourceSchema', () => {
  it('accepts valid input', () => {
    const result = createResourceSchema.safeParse({
      name: 'Laptop',
      description: 'A great laptop',
      price: 999.99,
    });
    expect(result.success).toBe(true);
  });

  it('accepts input without description (optional)', () => {
    const result = createResourceSchema.safeParse({ name: 'Laptop', price: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createResourceSchema.safeParse({ name: '', price: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 200 characters', () => {
    const result = createResourceSchema.safeParse({ name: 'a'.repeat(201), price: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = createResourceSchema.safeParse({ name: 'Item', price: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects missing price', () => {
    const result = createResourceSchema.safeParse({ name: 'Item' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = createResourceSchema.safeParse({ price: 100 });
    expect(result.success).toBe(false);
  });
});

describe('updateResourceSchema', () => {
  it('accepts partial input', () => {
    const result = updateResourceSchema.safeParse({ price: 49.99 });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (no-op update)', () => {
    const result = updateResourceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = updateResourceSchema.safeParse({ price: -5 });
    expect(result.success).toBe(false);
  });
});

describe('resourceQuerySchema', () => {
  it('uses default page and limit when omitted', () => {
    const result = resourceQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('coerces string numbers from query string', () => {
    const result = resourceQuerySchema.safeParse({ page: '2', limit: '10', minPrice: '100' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.minPrice).toBe(100);
    }
  });

  it('rejects limit greater than 100', () => {
    const result = resourceQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects minPrice greater than maxPrice', () => {
    const result = resourceQuerySchema.safeParse({ minPrice: '500', maxPrice: '100' });
    expect(result.success).toBe(false);
  });

  it('accepts minPrice equal to maxPrice', () => {
    const result = resourceQuerySchema.safeParse({ minPrice: '100', maxPrice: '100' });
    expect(result.success).toBe(true);
  });
});

describe('idParamSchema', () => {
  it('accepts a valid positive integer', () => {
    const result = idParamSchema.safeParse({ id: '1' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(1);
  });

  it('rejects zero', () => {
    const result = idParamSchema.safeParse({ id: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects negative id', () => {
    const result = idParamSchema.safeParse({ id: '-1' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric string', () => {
    const result = idParamSchema.safeParse({ id: 'abc' });
    expect(result.success).toBe(false);
  });
});
