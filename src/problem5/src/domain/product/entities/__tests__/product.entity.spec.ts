import { Product } from '@/domain/product/entities/product.entity';

describe('Product Entity', () => {
  const now = new Date();
  const baseProps = {
    id: 'prod-001',
    name: 'Test Product',
    description: 'Sample description',
    price: 100,
    stock: 50,
    category: 'Electronics',
    createdAt: now,
  };

  it('should create a product with default values', () => {
    const product = new Product(baseProps);

    expect(product.id).toBe(baseProps.id);
    expect(product.name).toBe(baseProps.name);
    expect(product.description).toBe(baseProps.description);
    expect(product.price).toBe(baseProps.price);
    expect(product.stock).toBe(baseProps.stock);
    expect(product.category).toBe(baseProps.category);
    expect(product.createdAt.getTime()).toBe(baseProps.createdAt.getTime());
    expect(product.isActive).toBe(true);
    expect(product.images).toEqual([]);
    expect(product.tags).toEqual([]);
  });

  it('should update name', () => {
    const product = new Product(baseProps);
    product.updateName('New Name');
    expect(product.name).toBe('New Name');
  });

  it('should not allow empty name', () => {
    const product = new Product(baseProps);
    expect(() => product.updateName('')).toThrow('Product name must not be empty.');
  });

  it('should update description', () => {
    const product = new Product(baseProps);
    product.updateDescription('Updated description');
    expect(product.description).toBe('Updated description');
  });

  it('should throw if description is too long', () => {
    const product = new Product(baseProps);
    const longDesc = 'x'.repeat(1001);
    expect(() => product.updateDescription(longDesc)).toThrow('Description is too long.');
  });

  it('should update price', () => {
    const product = new Product(baseProps);
    product.updatePrice(200);
    expect(product.price).toBe(200);
  });

  it('should throw if price is negative', () => {
    const product = new Product(baseProps);
    expect(() => product.updatePrice(-10)).toThrow('Price cannot be negative.');
  });

  it('should update stock', () => {
    const product = new Product(baseProps);
    product.updateStock(99);
    expect(product.stock).toBe(99);
  });

  it('should throw if stock is not an integer', () => {
    const product = new Product(baseProps);
    expect(() => product.updateStock(10.5)).toThrow('Stock must be an integer.');
  });

  it('should change category', () => {
    const product = new Product(baseProps);
    product.changeCategory('Apparel');
    expect(product.category).toBe('Apparel');
  });

  it('should throw if category is empty', () => {
    const product = new Product(baseProps);
    expect(() => product.changeCategory('')).toThrow('Category must not be empty.');
  });

  it('should deactivate and reactivate the product', () => {
    const product = new Product(baseProps);
    product.deactivate();
    expect(product.isActive).toBe(false);
    product.activate();
    expect(product.isActive).toBe(true);
  });

  it('should add and remove images', () => {
    const product = new Product(baseProps);
    product.addImage('http://example.com/image.jpg');
    expect(product.images).toContain('http://example.com/image.jpg');

    product.removeImage('http://example.com/image.jpg');
    expect(product.images).not.toContain('http://example.com/image.jpg');
  });

  it('should throw if image url is invalid', () => {
    const product = new Product(baseProps);
    expect(() => product.addImage('invalid-url')).toThrow('Invalid image URL.');
  });

  it('should add and remove tags', () => {
    const product = new Product(baseProps);
    product.addTag('hot');
    product.addTag('sale');
    expect(product.tags).toEqual(['hot', 'sale']);

    product.removeTag('hot');
    expect(product.tags).toEqual(['sale']);
  });

  it('should ignore duplicate tags', () => {
    const product = new Product(baseProps);
    product.addTag('new');
    product.addTag('new');
    expect(product.tags).toEqual(['new']);
  });

  it('should throw when tag is empty', () => {
    const product = new Product(baseProps);
    expect(() => product.addTag('')).toThrow('Tag must not be empty.');
  });

  it('should decrease and increase stock', () => {
    const product = new Product({ ...baseProps, stock: 20 });
    product.decreaseStock(5);
    expect(product.stock).toBe(15);
    product.increaseStock(10);
    expect(product.stock).toBe(25);
  });

  it('should throw if decreaseStock exceeds current stock', () => {
    const product = new Product({ ...baseProps, stock: 5 });
    expect(() => product.decreaseStock(10)).toThrow('Insufficient stock.');
  });

  it('should throw if increaseStock or decreaseStock quantity is invalid', () => {
    const product = new Product(baseProps);
    expect(() => product.increaseStock(0)).toThrow('Quantity must be a positive integer.');
    expect(() => product.decreaseStock(0)).toThrow('Quantity must be a positive integer.');
  });
});
