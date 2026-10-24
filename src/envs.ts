import * as z from 'zod'
import 'dotenv/config'

export const envs = z
  .object({
    POSTGRES_DB: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PASSWORD: z.string(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
  })
  .transform((obj) => ({
    postgresDB: obj.POSTGRES_DB,
    postgresHost: obj.POSTGRES_HOST,
    postgresUser: obj.POSTGRES_USER,
    postgresPort: obj.POSTGRES_PORT,
    postgresPassword: obj.POSTGRES_PASSWORD,
    betterAuthSecret: obj.BETTER_AUTH_SECRET,
    betterAuthUrl: obj.BETTER_AUTH_URL,
    databaseUrl: `postgresql://${obj.POSTGRES_USER}:${obj.POSTGRES_PASSWORD}@${obj.POSTGRES_HOST}:${obj.POSTGRES_PORT}/${obj.POSTGRES_DB}?schema=public`,
  }))
  .parse(process.env)
