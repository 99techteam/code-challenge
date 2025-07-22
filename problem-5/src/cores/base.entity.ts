import { ObjectId } from "mongoose";

export class BaseEntity {
  _id: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
