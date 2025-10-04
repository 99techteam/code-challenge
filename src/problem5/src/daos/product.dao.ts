import { Knex } from "knex";
import { IProduct } from "../models/product.model";
import BaseDao from "../daos/base/base.dao";

class ProductDao extends BaseDao<IProduct> {
  protected getTableName() {
    return "product";
  }

  protected getKeys() {
    return [
      "id",
      "name",
      "description",
      "imageUrl",
      "price",
      "publishDate",
      "manufacturer",
      "createdAt",
      "updatedAt",
      "delFlg",
    ];
  }

  protected hasDeleteFlg() {
    return true;
  }

  async add(
    item: Partial<IProduct>,
    transaction?: Knex.Transaction
  ): Promise<IProduct> {
    return super.add(
      {
        ...item,
      },
      transaction
    );
  }
}

const instance = new ProductDao();

export default instance;
