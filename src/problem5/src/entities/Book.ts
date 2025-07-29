import { Entity, PrimaryKey, Property, Index } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";
import { BookGenre } from "../types";

@Entity({ tableName: "books" })
export class Book {
  @PrimaryKey()
  id: string = uuidv4();

  @Property({ length: 255 })
  title!: string;

  @Property({ length: 255 })
  author!: string;

  @Property({ length: 13 })
  @Index()
  isbn!: string;

  @Property()
  publishedYear!: number;

  @Property({ type: "string", length: 50 })
  genre!: BookGenre;

  @Property({ length: 1000, nullable: true })
  description?: string;

  @Property({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
