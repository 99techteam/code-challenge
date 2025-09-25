import { eq, ilike, desc, asc, count, and, SQL } from 'drizzle-orm';
import { db } from '../lib/db';
import { entities, type Entity, type NewEntity } from '../lib/schema';

export class EntityService {
  public static async get(id: string): Promise<Entity | null> {
    const result = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
    return result[0] || null;
  }

  public static async list({
    search,
    sort,
    page = 1,
    pageSize = 10
  }: {
    search?: string;
    sort?: string;
    page?: number;
    pageSize?: number
  }) {
    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(entities.name, `%${search}%`));
    }

    let orderBy;
    if (sort) {
      const [field, direction] = sort.split(':');
      if (field === 'name') {
        orderBy = direction === 'desc' ? desc(entities.name) : asc(entities.name);
      } else if (field === 'createdAt') {
        orderBy = direction === 'desc' ? desc(entities.createdAt) : asc(entities.createdAt);
      } else {
        orderBy = desc(entities.createdAt);
      }
    } else {
      orderBy = desc(entities.createdAt);
    }

    const offset = (page - 1) * pageSize;
    const query = db.select().from(entities);
    
    const results = await (conditions.length > 0 
      ? query.where(and(...conditions)).orderBy(orderBy).limit(pageSize).offset(offset)
      : query.orderBy(orderBy).limit(pageSize).offset(offset));

    const countQuery = db.select({ count: count() }).from(entities);
    const totalResult = await (conditions.length > 0 
      ? countQuery.where(and(...conditions))
      : countQuery);
    const total = totalResult[0].count;
    
    return {
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  public static async createOrUpdate(data: Partial<NewEntity> & { id?: string }): Promise<Entity> {
    if (data.id) {
      const result = await db.update(entities)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(entities.id, data.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(entities)
        .values(data as NewEntity)
        .returning();
      return result[0];
    }
  }

  public static async delete(id: string): Promise<boolean> {
    const result = await db.delete(entities).where(eq(entities.id, id)).returning();
    return result.length > 0;
  }
}