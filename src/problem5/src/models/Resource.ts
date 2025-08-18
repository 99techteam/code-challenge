import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

// Define the attributes interface
export interface ResourceAttributes {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

// Define creation attributes (optional id, timestamps)
export interface ResourceCreationAttributes 
  extends Optional<ResourceAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'metadata'> {}

// Define the Sequelize model
export class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> 
  implements ResourceAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public status!: 'active' | 'inactive';
  public metadata!: Record<string, unknown>;
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize the model
Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'resources',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
