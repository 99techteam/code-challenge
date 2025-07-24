import { generateUUID } from '../uuid.util';

describe('generateUUID', () => {
  it('should return a valid UUID string', () => {
    const uuid = generateUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
