import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

class AuditField {
  @Column({ type: "varchar", length: 36, name: "created_by", nullable: true })
  createdBy?: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at", nullable: true })
  updatedAt?: Date;
}

export default AuditField;