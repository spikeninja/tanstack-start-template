import { user } from '#/server/db/schemas/auth'
import type { TX } from '#/server/db'

export class UsersRepository {
  constructor(private readonly tx: TX) {}

  async getAllUsers() {
    return this.tx.select().from(user)
  }
}
