#!/usr/bin/env node

const yargs = require('yargs');
const { execSync } = require('child_process');

const {
  _: [type, name],
} = yargs.argv;

if (!name && type != 'seed-run') {
  console.error('Name missing!');
  process.exit(1);
}

if (type == 'migration') {
  const migrationPath = `src/databases/migrations/${name}`;
  execSync(`typeorm migration:create ${migrationPath}`, { stdio: 'inherit' });
}

if (type == 'seed') {
  const seederPath = `src/databases/seeders/${name}`;
  execSync(
    `ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:create --name ${seederPath}`,
    { stdio: 'inherit' }
  );
}

if (type == 'seed-run') {
  let cmd =
    'ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:run -d src/databases/datasource.ts';

  if (name) {
    cmd += ` -n ${name}`;
  }

  execSync(cmd, { stdio: 'inherit' });
}
