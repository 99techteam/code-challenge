import { calculatePagination, buildPaginatedResult } from '../pagination.util';

describe('Pagination Utilities', () => {
  describe('calculatePagination', () => {
    it('should calculate correct offset and limit', () => {
      const result = calculatePagination({ page: 2, limit: 10 });
      expect(result).toEqual({ offset: 10, limit: 10 });
    });

    it('should default page and limit to at least 1', () => {
      const result = calculatePagination({ page: 0, limit: 0 });
      expect(result).toEqual({ offset: 0, limit: 1 });
    });
  });

  describe('buildPaginatedResult', () => {
    const sampleData = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));

    it('should return a proper paginated result', () => {
      const result = buildPaginatedResult(sampleData, 50, 2, 5);
      expect(result).toEqual({
        data: sampleData,
        page: 2,
        total: 50,
        totalPages: 10,
      });
    });

    it('should handle total = 0 correctly', () => {
      const result = buildPaginatedResult([], 0, 1, 10);
      expect(result).toEqual({
        data: [],
        page: 1,
        total: 0,
        totalPages: 0,
      });
    });
  });
});
