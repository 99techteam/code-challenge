import { User } from '@/modules/user/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserSeeder1756096575458 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const repository = dataSource.getRepository(User);
    await repository.clear();
    await repository.insert([
      {
        username: 'demo',
        email: 'user@gmail.com',
        password: 'Matkhau@123',
      },
    ]);
  }
}
