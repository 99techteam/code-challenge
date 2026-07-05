import { PoolClient, QueryResultRow } from 'pg';
import { Database } from './database';
import { IProductRepository } from './interfaces';
import { Product, ProductRow, ProductFilter, CreateProductInput, UpdateProductInput } from '../model/product';
import { logger } from '../logger';
import { generateProductId } from '../types/branded';

export class ProductRepository implements IProductRepository {
  constructor(private readonly pool: Database) {}

  private mapRowToDomain(row: QueryResultRow): Product {
    const productRow = row as ProductRow;
    return {
      id: productRow.id,
      name: productRow.name,
      description: productRow.description,
      price: Number(productRow.price),
      category: productRow.category,
      sku: productRow.sku,
      isActive: productRow.is_active,
      metadata: productRow.metadata || {},
      createdAt: productRow.created_at.toISOString(),
      updatedAt: productRow.updated_at.toISOString(),
    };
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async create(input: CreateProductInput): Promise<Product> {
    const id = generateProductId();
    const columns = ['id', 'name', 'description', 'price', 'category', 'sku', 'is_active', 'metadata'];
    const values = [
      id,
      input.name,
      input.description || '',
      input.price,
      input.category,
      input.sku,
      input.isActive ?? true,
      JSON.stringify(input.metadata || {}),
    ];

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO products (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(sql, values);
    const product = this.mapRowToDomain(result.rows[0]);
    logger.debug({ productId: product.id }, 'Product created in database');
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query(
      `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.pool.query(
      `SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL`,
      [sku]
    );
    return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null;
  }

  async findBySkuForUpdate(sku: string, client: PoolClient): Promise<Product | null> {
    const result = await client.query(
      `SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL FOR UPDATE`,
      [sku]
    );
    return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null;
  }

  async findAll(filter: ProductFilter): Promise<{ products: Product[]; total: number }> {
    // ============================================================================
    // QUERY OPTIMIZATION NOTES
    // ============================================================================
    //
    // INDEX STRATEGY:
    // - deleted_at IS NULL: Partial indexes automatically filter soft-deleted rows
    // - category: Uses idx_products_active_category_created (composite index)
    // - price range: Uses idx_products_active_price
    // - ORDER BY created_at DESC: Uses idx_products_active_created or composite index
    // - ILIKE search: Uses idx_products_name_trgm (pg_trgm GIN index)
    //
    // PERFORMANCE CHARACTERISTICS:
    // - Category filter + sort: O(log n) index scan
    // - Price range filter: O(log n) index range scan
    // - Search (ILIKE): O(log n) trigram index scan (vs O(n) full table scan)
    // - Pagination (LIMIT/OFFSET): Efficient with proper indexes
    //
    // ASSUMPTIONS:
    // - Most products are active (deleted_at IS NULL) - typically 90%+
    // - Category has moderate cardinality (10-100 distinct values)
    // - Price distribution is relatively uniform
    // - Search terms are typically 3+ characters (trigram effectiveness)
    // ============================================================================

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filter.category) {
      params.push(filter.category);
      conditions.push(`category = $${params.length}`);
    }

    if (filter.minPrice !== undefined) {
      params.push(filter.minPrice);
      conditions.push(`price >= $${params.length}`);
    }

    if (filter.maxPrice !== undefined) {
      params.push(filter.maxPrice);
      conditions.push(`price <= $${params.length}`);
    }

    if (filter.search) {
      const escapedSearch = filter.search
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
      params.push(`%${escapedSearch}%`);
      // ILIKE with leading wildcard - uses pg_trgm GIN index
      // Without pg_trgm, this would cause a full table scan
      conditions.push(`name ILIKE $${params.length} ESCAPE '\\'`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (filter.page - 1) * filter.limit;

    const dataParams = [...params, filter.limit, offset];
    const dataSql = `
      SELECT * FROM products
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;

    const countSql = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(dataSql, dataParams),
      this.pool.query(countSql, params),
    ]);

    const products = dataResult.rows.map((row) => this.mapRowToDomain(row));
    const total = parseInt(countResult.rows[0].total, 10);

    return { products, total };
  }

  async updateProduct(id: string, input: UpdateProductInput, client?: PoolClient): Promise<Product | null> {
    const executor = client ?? this.pool;

    const fieldMap: Record<string, unknown> = {
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      sku: input.sku,
      is_active: input.isActive,
      metadata: input.metadata !== undefined ? JSON.stringify(input.metadata) : undefined,
    };

    const updates: string[] = [];
    const values: unknown[] = [];

    Object.entries(fieldMap).forEach(([column, value]) => {
      if (value !== undefined) {
        values.push(value);
        updates.push(`${column} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = NOW()');

    const setClause = updates.join(', ');
    const sql = `
      UPDATE products
      SET ${setClause}
      WHERE id = $${values.length + 1} AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await executor.query(sql, [...values, id]);
    const product = result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null;

    if (product) {
      logger.debug({ productId: id }, 'Product updated in database');
    }
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE products
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    const deleted = (result.rowCount ?? 0) > 0;
    if (deleted) {
      logger.debug({ productId: id }, 'Product soft deleted in database');
    }
    return deleted;
  }
}
