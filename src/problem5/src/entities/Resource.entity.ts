import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: false 
  })
  name!: string;

  @Column({ 
    type: 'text',
    nullable: false 
  })
  description!: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true 
  })
  category?: string;

  @Column({ 
    type: 'boolean',
    default: true,
    nullable: false 
  })
  isActive!: boolean;

  @CreateDateColumn({ 
    type: 'timestamp'
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    type: 'timestamp'
  })
  updatedAt!: Date;

  constructor() {
    // Initialize default values
    this.isActive = true;
  }
} 