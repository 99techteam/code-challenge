import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn } from "typeorm";

  
  @Entity("resources")
  export class ResourceOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column()
    name!: string;
  
    @Column({ nullable: true })
    description?: string;
  
    @CreateDateColumn()
    createdAt!: Date;
  }
  