import { CreateResourceDto } from '../../dto';

export class CreateResourceCommand {
  constructor(
    public readonly data: CreateResourceDto
  ) {}
} 