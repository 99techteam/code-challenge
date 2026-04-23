import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "resources" })
export class ResourceEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text" })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ name: "is_finish", type: "boolean", default: false })
    isFinish!: boolean;

    @CreateDateColumn({
        name: "created_at",
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: "updated_at",
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;
}
