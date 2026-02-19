import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const JwtSecretSchema = isTest
  ? z.string().min(20).default("test_secret_test_secret_test_secret")
  : z.string().min(20);

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/mean_school"),
  JWT_SECRET: JwtSecretSchema,
  CORS_ORIGIN: z.string().min(1).optional(),
});

export const env = EnvSchema.parse(process.env);

