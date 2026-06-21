import "dotenv/config";
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default("3000").transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.url().default('file:./dev.db'),
});

const parseResult = environmentSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('Missing or invalid environment layout variables:');
  console.error(JSON.stringify(z.treeifyError(parseResult.error), null, 2));
  process.exit(1); // Stop the server application process immediately
}

export const config = parseResult.data;

export type AppConfig = z.infer<typeof environmentSchema>;