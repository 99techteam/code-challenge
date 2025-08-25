import {
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

export class BaseEntities {
	@PrimaryGeneratedColumn()
	id!: number;

	@CreateDateColumn({
		type: 'timestamp',
		nullable: false,
	})
	created_at!: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		nullable: false,
	})
	updated_at!: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deleted_at!: Date;
}
