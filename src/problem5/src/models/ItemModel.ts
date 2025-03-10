import mongoose, { Schema, Document } from 'mongoose';

interface IItem extends Document {
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ItemSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IItem>('Item', ItemSchema);
