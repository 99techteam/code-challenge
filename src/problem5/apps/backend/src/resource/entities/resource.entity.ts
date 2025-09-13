import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResourceDocument = Resource & Document;

@Schema()
export class Resource {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
