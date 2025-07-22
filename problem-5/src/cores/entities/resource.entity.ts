import { Prop, ModelOptions } from "@typegoose/typegoose";
import { BaseEntity } from "../base.entity";

export const RESOURCE_COLLECTION = "resources";
@ModelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: true,
      updatedAt: true
    },
    collection: RESOURCE_COLLECTION
  }
})
export class ResourceEntity extends BaseEntity {
  @Prop({ required: true })
  public name!: string;
}
