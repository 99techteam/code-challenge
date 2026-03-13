import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateResourcesTable1741132800000 implements MigrationInterface {
  name = 'CreateResourcesTable1741132800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."resources_status_enum" AS ENUM('active', 'inactive')`,
    )

    await queryRunner.createTable(
      new Table({
        name: 'resources',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            enumName: 'resources_status_enum',
            default: "'active'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('resources')
    await queryRunner.query(`DROP TYPE "public"."resources_status_enum"`)
  }
}
