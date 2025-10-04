import { DELETE_FLG, IObject } from "../../shared/constants";
import { dateToDbStr } from "../../shared/dateUtils";
import { objToCamel, strToSnake } from "../../shared/functions";
import { Knex } from "knex";
import knex from "./knexWrapper";
import "./setupTypeParser";

export interface DaoGetOneOptions {
  fields?: string | string[];
  order?: OrderCondition[];
}

export interface DaoGetManyOptions extends DaoGetOneOptions {
  limit?: number;
  offset?: number;
}

export interface DaoConditions extends IObject {
  _raw?: string;
}

export interface OrderCondition {
  name: string;
  order: "asc" | "desc";
}

export default abstract class BaseDao<Entity> {
  protected knex = knex;
  protected keys: string[] = [];
  protected abstract getTableName(): string;
  protected abstract getKeys(): string[];
  protected abstract hasDeleteFlg(): boolean;

  constructor() {
    this.keys = this.getKeys().map(strToSnake);
  }

  async getUUID(): Promise<string> {
    const { v4: uuidv4 } = await import("uuid");
    return uuidv4();
  }

  getTransaction(): Promise<Knex.Transaction> {
    return new Promise((resolve) => {
      this.knex.transaction((trx) => resolve(trx));
    });
  }

  getBuilder(transaction?: Knex.Transaction): Knex.QueryBuilder<any> {
    return (transaction || this.knex)<any>(this.getTableName());
  }

  async getOne(
    conditions?: DaoConditions,
    options?: DaoGetOneOptions,
    transaction?: Knex.Transaction
  ): Promise<Entity | null> {
    const defaultCondition = this.bindDefaultCondition(conditions);
    const res = await this.mapOptions(
      this.mapCondition(this.getBuilder(transaction), defaultCondition),
      options
    ).first();
    return <Entity | null>objToCamel(res);
  }

  async getMany(
    conditions?: DaoConditions,
    options?: DaoGetManyOptions,
    transaction?: Knex.Transaction
  ): Promise<Entity[]> {
    const defaultCondition = this.bindDefaultCondition(conditions);
    const res = await this.mapOptions(
      this.mapCondition(this.getBuilder(transaction), defaultCondition),
      options
    ).select();
    return <Entity[]>objToCamel(res);
  }

  async getTotal(conditions?: DaoConditions): Promise<number> {
    const defaultCondition = this.bindDefaultCondition(conditions);
    const res = await this.mapCondition(
      this.getBuilder(),
      defaultCondition
    ).count({
      count: "*",
    });
    return parseInt(res.length ? res[0]["count"] ?? 0 : 0);
  }

  async add(
    item: Partial<Entity>,
    transaction?: Knex.Transaction
  ): Promise<Entity> {
    const res = await this.getBuilder(transaction).insert(
      this.formatDataWrite(item),
      "*"
    );
    return <Entity>objToCamel(res[0]);
  }

  async bulkInsert(
    items: Array<Partial<Entity>>,
    transaction?: Knex.Transaction
  ): Promise<Array<Entity>> {
    const res = await this.getBuilder(transaction).insert(
      items.map((item) => this.formatDataWrite(item)),
      "*"
    );
    return res.map((i) => <Entity>objToCamel(i[0]));
  }

  async update(
    conditions: DaoConditions,
    item: Partial<Entity>,
    transaction?: Knex.Transaction
  ): Promise<Entity[]> {
    const defaultCondition = this.bindDefaultCondition(conditions, false);
    const res: any = await this.mapCondition(
      this.getBuilder(transaction),
      defaultCondition
    ).update(this.formatDataWrite(item), "*");
    return <Entity[]>objToCamel(res);
  }

  async delete(
    conditions: DaoConditions,
    transaction?: Knex.Transaction,
    hardDelete: boolean = false
  ): Promise<void> {
    const defaultCondition = this.bindDefaultCondition(conditions, false);
    const query = this.mapCondition(
      this.getBuilder(transaction),
      defaultCondition
    );
    if (this.hasDeleteFlg() && !hardDelete) {
      return query.update({
        del_flg: DELETE_FLG.DELETED,
      });
    } else {
      return query.delete();
    }
  }

  protected bindDefaultCondition(
    conditions?: DaoConditions,
    checkDelFlg: boolean = true
  ) {
    const defaultCondition = conditions || {};
    if (this.hasDeleteFlg() && !("delFlg" in defaultCondition) && checkDelFlg) {
      defaultCondition["delFlg"] = DELETE_FLG.VALID;
    }
    return defaultCondition;
  }

  protected mapCondition(
    builder: Knex.QueryBuilder<any>,
    conditions?: DaoConditions
  ): Knex.QueryBuilder<any> {
    if (conditions instanceof Object) {
      for (const key of Object.keys(conditions)) {
        const condition = conditions[key];
        if (condition === undefined) continue;
        const keySnake = strToSnake(key);
        const operator = condition instanceof Array ? condition[0] : null;
        const value = condition instanceof Array ? condition[1] : condition;
        if (String(operator).toLowerCase() === "in") {
          value instanceof Array &&
            value.length &&
            builder.whereIn(keySnake, value);
        } else if (keySnake === "_raw") {
          builder.whereRaw(value);
        } else if (operator) {
          builder.where(keySnake, operator, value);
        } else {
          builder.where(keySnake, value);
        }
      }
    }
    return builder;
  }

  protected mapOptions(
    builder: Knex.QueryBuilder<any>,
    options?: DaoGetManyOptions
  ) {
    if (options instanceof Object) {
      const { fields, limit, offset, order } = options;
      if (offset !== undefined) {
        builder.offset(offset);
      }
      if (limit !== undefined) {
        builder.limit(limit);
      }
      if (fields instanceof Array) {
        builder.select(...fields.map((f) => strToSnake(f)));
      }
      if (typeof fields === "string") {
        builder.select(
          ...fields
            .split(",")
            .map((f) => strToSnake(f.trim()))
            .filter((f) => f && this.keys.includes(f))
        );
      }
      if (order !== undefined && order.length) {
        order.forEach((item) => {
          builder.orderBy(strToSnake(item.name.trim()), item.order);
        });
      }
    }
    return builder;
  }

  protected formatDataWrite(item: any) {
    const itemFormatted: DaoConditions = {};
    for (const key of Object.keys(item)) {
      itemFormatted[strToSnake(key)] = this.formatFieldDataWrite(item[key]);
    }
    return itemFormatted;
  }

  protected formatFieldDataWrite(fieldValue: any) {
    return fieldValue instanceof Date ? dateToDbStr(fieldValue) : fieldValue;
  }
}
