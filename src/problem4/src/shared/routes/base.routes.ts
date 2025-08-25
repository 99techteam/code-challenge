import { Router } from 'express';

export abstract class BaseRoutes<TController> {
  public router: Router;

  constructor(protected controller: TController) {
    this.router = Router();
    this.initialize();
  }

  protected initialize(): void {
    this.bindControllerMethods();
    this.registerRoutes();
  }

  protected bindControllerMethods(): void {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this.controller))
      .filter((method) => method !== 'constructor')
      .forEach((method) => {
        const func = this.controller[method as keyof TController];
        if (typeof func === 'function') {
          this.controller[method as keyof TController] = func.bind(
            this.controller
          );
        }
      });
  }

  protected abstract registerRoutes(): void;
}
