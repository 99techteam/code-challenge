import { PrimaryGeneratedColumn } from "typeorm";
import AuditField from "./AuditField";

export abstract class BaseEntity extends AuditField {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
}