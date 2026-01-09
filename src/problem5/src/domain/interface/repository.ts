import { RepositoryInterface } from './interface';

export class Repository {

  private static _instance: RepositoryInterface;

  private constructor() { }

  public static get instance(): RepositoryInterface {
    return this._instance;
  }

  public static set instance(instance: RepositoryInterface) {
    this._instance = instance;
  }
}
