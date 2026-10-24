import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { envs } from '@/envs'
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import type { PgAsyncTransaction } from 'drizzle-orm/pg-core'
import type { EmptyRelations } from 'drizzle-orm'

const pool = new Pool({
  connectionString: envs.databaseUrl,
})

export const db = drizzle({ client: pool })

export type DB = typeof db
export type TX = PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>
