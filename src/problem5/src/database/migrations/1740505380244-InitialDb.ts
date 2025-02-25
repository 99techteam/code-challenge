import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDb1740505380244 implements MigrationInterface {
    name = 'InitialDb1740505380244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`created_by\` \`created_by\` varchar(36) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`created_by\` \`created_by\` varchar(36) NULL DEFAULT 'NULL'`);
    }

}
