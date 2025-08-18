import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('resources', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
  });

  // Create indexes for better performance (only if they don't exist)
  try {
    await queryInterface.addIndex('resources', ['category'], {
      name: 'idx_resources_category',
    });
  } catch (error) {
    // Index might already exist, ignore error
  }

  try {
    await queryInterface.addIndex('resources', ['status'], {
      name: 'idx_resources_status',
    });
  } catch (error) {
    // Index might already exist, ignore error
  }

  try {
    await queryInterface.addIndex('resources', ['created_at'], {
      name: 'idx_resources_created_at',
    });
  } catch (error) {
    // Index might already exist, ignore error
  }

  // Create GIN indexes for full-text search (PostgreSQL specific)
  await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_resources_name_search
    ON resources USING gin(to_tsvector('english', name))
  `);

  await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_resources_description_search
    ON resources USING gin(to_tsvector('english', description))
  `);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('resources');
};
