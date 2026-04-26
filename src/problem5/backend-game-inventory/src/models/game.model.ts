import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  title: string;
  genre: string;
  platform: string;
  quantity: number;
  price: number;
}

const GameSchema = new Schema<IGame>(
  {
    title: { type: String, required: true, index: true },
    genre: { type: String, required: true, index: true },
    platform: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

GameSchema.index({ title: "text" });
GameSchema.index({ genre: "text" });

export const Game = mongoose.model<IGame>("Game", GameSchema);