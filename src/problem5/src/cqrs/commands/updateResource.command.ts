import { UpdateResourceDto } from '../../dto';

export class UpdateResourceCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateResourceDto
  ) {}
} 