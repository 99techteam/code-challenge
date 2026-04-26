import { z } from "zod";


const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z
    .string()
    .default("3000")
    .transform((val) => Number(val)),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;