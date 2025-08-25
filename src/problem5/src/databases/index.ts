import 'reflect-metadata';
import MainDataSource from './datasource';
import { DataSource } from 'typeorm';

class Database {
  protected connection: DataSource;

  constructor() {
    this.connection = this.initDataSource();
  }

  initDataSource(): DataSource {
    return MainDataSource;
  }

  async connectToDatabase() {
    try {
      await this.connection.initialize();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw (error as Error).message;
    }
  }
}

export default new Database();
