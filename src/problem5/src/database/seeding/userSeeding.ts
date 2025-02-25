import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/User';
import { UserGender } from '../../enums/UserGender';

const userSeeding = async (appSource: DataSource): Promise<void> => {
  const userRepo: Repository<User> = appSource.getRepository(User);

  if ((await userRepo.count()) == 0) {
    const users: User[] = [
      {
        id: 'dc139449-56ea-4fd6-89b2-a7db8a0dd46f',
        createdBy: 'system',
        createdAt: new Date('2023-01-01T10:00:00'),
        updatedAt: new Date('2023-01-01T10:00:00'),
        firstName: 'John',
        lastName: 'Doe',
        gender: UserGender.MALE, // corrected gender based on first name
        email: 'john.doe@example.com',
      },
      {
        id: 'e414085e-0c2a-4bcd-911a-794a801fc1ae',
        createdBy: 'system',
        createdAt: new Date('2023-01-02T10:00:00'),
        updatedAt: new Date('2023-01-02T10:00:00'),
        firstName: 'Jane',
        lastName: 'Smith',
        gender: UserGender.FEMALE,
        email: 'jane.smith@example.com',
      },
    ];

    await userRepo.save(users);
  }
};

export default userSeeding;