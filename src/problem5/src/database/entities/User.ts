import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {

  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: false })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: false })
  lastName!: string;

  @Column({ type: 'tinyint', default: 0 })
  gender!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

}