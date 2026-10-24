import { db } from '#/server/db'
import { UsersRepository } from '#/server/repositories/users'

export async function getAllUsersInteractor() {
  return db.transaction(async (tx) => {
    const usersRepository = new UsersRepository(tx)
    return usersRepository.getAllUsers()
  })
}
