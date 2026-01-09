import { Collection, MongoClient, Db, ObjectId } from 'mongodb';
import * as Logger from '../../../utils/Logger';
import * as schema from '../../../domain/schema';

import {
  RepositoryInterface,
  RepositoryInternalError,
  NotFoundError,
} from '../../../domain/interface';

export interface DB {
  users: Collection<schema.IStoredUser | schema.IUserData>;
}

export class MongoRepository implements RepositoryInterface {

  private db: Db;
  private users: Collection<schema.IStoredUser | schema.IUserData>;

  constructor(client: MongoClient, dbName?: string) {
    this.db = client.db(dbName);
    this.users = this.db.collection('users');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapDoc(doc: any) {
    const result = doc;

    if (result.password) {
      delete result.password; // Remove the password key from the result object
    }

    if (doc._id && doc._id.toHexString) {
      result._id = doc._id.toHexString();
    }

    return result;
  }

  private convertId(id: string | ObjectId): ObjectId | string {
    try {
      return new ObjectId(id);
    } catch {
      return id;
    }
  }

  /*
  * Get All users
  * @params null
  * @return schema.IStoredUser[]
  */
  public async getAllUsers(
    filters: schema.UserFilters = {},
    pagination: schema.PaginationOptions = {}
  ): Promise<{ data: schema.IStoredUser[]; total: number }> {
    try {
      const page = pagination.page ?? 1;
      const limit = pagination.limit ?? 10;
      const skip = (page - 1) * limit;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (filters.email) {
        query.email = { $regex: filters.email, $options: "i" };
      }

      if (filters.name) {
        query.name = { $regex: filters.name, $options: "i" };
      }

      if (filters.city) {
        query.city = filters.city;
      }

      if (filters.gender) {
        query.gender = filters.gender;
      }

      if (filters.userRole !== undefined) {
        query.userRole = filters.userRole;
      }

      if (filters.isBlock !== undefined) {
        query.isBlock = filters.isBlock;
      }

      const [docs, total] = await Promise.all([
        this.users
          .find(query)
          .sort({ joinDate: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),

        this.users.countDocuments(query)
      ]);

      Logger.instance.debug({
        module: "GetAllUsers",
        query,
        page,
        limit,
        total
      });

      return {
        data: docs.map(this.mapDoc),
        total
      };

    } catch (error) {
      Logger.instance.error({ module: "GetAllUsers", error });
      throw new RepositoryInternalError(error as Error);
    }
  }

  /*
  * Get User Information by ID
  * @params user Id : string
  * @return schema.IStoredUser
  */
  public async getUserById(id: string): Promise<schema.IStoredUser> {
    try {
      const doc = await this.users.findOne<schema.IStoredUser>({ _id: this.convertId(id) });
      return await new Promise((resolve, reject) => {
        Logger.instance.debug('getUserById', doc);
        if (doc) {
          resolve(this.mapDoc(doc));
        } else {
          reject(new NotFoundError('User'));
        }
      });
    } catch (error) {
      Logger.instance.error('getUserById', error);
      throw new RepositoryInternalError(error as Error);
    }
  }

  /*
  * Get User Information by Email
  * @params user Email : string
  * @return schema.IStoredUser
  */
  public async getUserByEmail(email: string): Promise<schema.IStoredUser> {
    try {
      const doc = await this.users.findOne<schema.IStoredUser>({ email: email });
      return new Promise((resolve, reject) => {
        Logger.instance.debug({ module: 'getUserByEmail', doc });
        if (doc) {
          resolve(this.mapDoc(doc));
        } else {
          reject(new NotFoundError('User'));
        }
      });
    } catch (error) {
      Logger.instance.error('getUserByEmail', error);
      throw new RepositoryInternalError(error as Error);
    }
  }

  /*
  * Get User Information by Email
  * @params user Email : string
  * @return schema.IStoredUser
  */
  public async getUserPasswordByEmail(email: string): Promise<schema.IStoredUser> {
    try {
      const doc = await this.users.findOne<schema.IStoredUser>({ email: email });
      return new Promise((resolve, reject) => {
        Logger.instance.debug({ module: 'getUserByEmail', doc });
        if (doc) {
          resolve(doc);
        } else {
          reject(new NotFoundError('User'));
        }
      });
    } catch (error) {
      Logger.instance.error('getUserByEmail', error);
      throw new RepositoryInternalError(error as Error);
    }
  }

  /*
  * Store User Information
  * @params payload: schema.IUserData
  * @return _id
  */
  public async storeUserData(payload: schema.IUserData): Promise<string | null> {
    try {
      const result = await this.users.insertOne(payload
      );
      Logger.instance.debug({ module: 'StoreUserData result', result });
      if (result.insertedId !== undefined) {
        Logger.instance.info({ module: 'StoreUserData', payload });
        return new ObjectId(result.insertedId).toHexString();
      } else {
        return null;
      }
    } catch (error) {
      Logger.instance.error({ module: 'StoreUserData', error });
      throw new RepositoryInternalError(error as Error);
    }
  }

  public async updateUserById(
    id: string,
    payload: Partial<schema.IUserData>
  ): Promise<schema.IStoredUser | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateDoc: Record<string, any> = {};

      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined) continue;

        if (key === 'emailVerified' || key === 'isBlock') {
          updateDoc[key] = Boolean(value);
        } else {
          updateDoc[key] = value;
        }
      }

      if (Object.keys(updateDoc).length === 0) {
        throw new RepositoryInternalError(
          new Error('No fields provided for update')
        );
      }

      updateDoc.updatedAt = new Date().toISOString();

      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('User', `User not found with id ${id}`);
      }
      return this.getUserById(id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      Logger.instance.error({ module: 'updateUserById', error });
      throw new RepositoryInternalError(error as Error);
    }
  }

  public async deleteUserById(id: string): Promise<void> {
    try {
      const result = await this.users.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        throw new NotFoundError('User', `User not found with id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      Logger.instance.error({ module: 'deleteUserById', error });
      throw new RepositoryInternalError(error as Error);
    }
  }
}
