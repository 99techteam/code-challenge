import { ResourceService } from '../resource.service';
import { ResourceRepository } from '../resource.repository';
import { AppError } from '../../../common/middleware/error.middleware';
import { HttpStatus } from '../../../common/constants/httpStatus';
import { Resource } from '../resource.model';

jest.mock('../resource.repository');

const MockedRepo = ResourceRepository as jest.Mocked<typeof ResourceRepository>;

const makeResource = (overrides: Partial<Resource> = {}): Resource =>
  ({
    id: 1,
    name: 'Laptop',
    description: 'A great laptop',
    price: 999.99,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as Resource);

const defaultFilters = { page: 1, limit: 20 };

beforeEach(() => jest.clearAllMocks());

describe('ResourceService.getAll', () => {
  it('delegates to repository and returns paginated result', async () => {
    const paginated = { data: [makeResource()], total: 1, page: 1, limit: 20, totalPages: 1 };
    MockedRepo.findAll.mockResolvedValue(paginated);

    const result = await ResourceService.getAll(defaultFilters);

    expect(MockedRepo.findAll).toHaveBeenCalledWith(defaultFilters);
    expect(result).toEqual(paginated);
  });
});

describe('ResourceService.getById', () => {
  it('returns resource when found', async () => {
    const resource = makeResource();
    MockedRepo.findById.mockResolvedValue(resource);

    const result = await ResourceService.getById(1);

    expect(MockedRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(resource);
  });

  it('throws 404 AppError when not found', async () => {
    MockedRepo.findById.mockResolvedValue(null);

    await expect(ResourceService.getById(99)).rejects.toThrow(AppError);
    await expect(ResourceService.getById(99)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
    });
  });
});

describe('ResourceService.create', () => {
  it('creates and returns a new resource', async () => {
    const dto = { name: 'Keyboard', price: 149.99 };
    const resource = makeResource({ name: 'Keyboard', price: 149.99 });
    MockedRepo.create.mockResolvedValue(resource);

    const result = await ResourceService.create(dto);

    expect(MockedRepo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(resource);
  });
});

describe('ResourceService.update', () => {
  it('updates and returns the resource when it exists', async () => {
    const existing = makeResource();
    const updated = makeResource({ price: 799.99 });
    MockedRepo.findById.mockResolvedValue(existing);
    MockedRepo.update.mockResolvedValue(updated);

    const result = await ResourceService.update(1, { price: 799.99 });

    expect(MockedRepo.update).toHaveBeenCalledWith(1, { price: 799.99 });
    expect(result.price).toBe(799.99);
  });

  it('throws 404 AppError when resource does not exist', async () => {
    MockedRepo.findById.mockResolvedValue(null);

    await expect(ResourceService.update(99, { price: 100 })).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
    expect(MockedRepo.update).not.toHaveBeenCalled();
  });
});

describe('ResourceService.delete', () => {
  it('deletes successfully when resource exists', async () => {
    MockedRepo.delete.mockResolvedValue(true);

    await expect(ResourceService.delete(1)).resolves.toBeUndefined();
    expect(MockedRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws 404 AppError when resource does not exist', async () => {
    MockedRepo.delete.mockResolvedValue(false);

    await expect(ResourceService.delete(99)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
