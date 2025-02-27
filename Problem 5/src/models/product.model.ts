import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// These are the attributes in the Product model
interface ProductAttributes {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// For creating a new Product - id, createdAt and updatedAt are optional
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Product model definition
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public price!: number;
    public category!: string;
    public inStock!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        inStock: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        tableName: 'products',
        timestamps: true
    }
);

export default Product;