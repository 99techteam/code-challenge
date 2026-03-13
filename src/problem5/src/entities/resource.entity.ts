import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Snowflake } from '../utils/snowflake'

export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('resources')
export class Resource {
  @PrimaryColumn({ type: 'bigint' })
  id: string

  @Column()
  name: string

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.ACTIVE,
  })
  status: ResourceStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = Snowflake.generate()
    }
  }
}
