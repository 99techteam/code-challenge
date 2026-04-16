import { Schema, model, type InferSchemaType } from "mongoose";

const resourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1
    },
    detail: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        ret._id = undefined;
        return ret;
      }
    }
  }
);

export type ResourceDocument = InferSchemaType<typeof resourceSchema>;

export const ResourceModel = model("Resource", resourceSchema);
