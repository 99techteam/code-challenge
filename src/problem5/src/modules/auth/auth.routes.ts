import { BaseRoutes } from '@/shared/routes/base.routes';
import { IAuthController } from './auth.interface';
import authController from './auth.controller';

class AuthRoute extends BaseRoutes<IAuthController> {
  constructor() {
    super(authController);
  }

  protected registerRoutes(): void {
    this.router.post('/login', this.controller.login);
    this.router.get('/profile', this.controller.getProfile);
  }
}

export default new AuthRoute();
