import { authMiddleware } from '#/server/middleware/auth'
import { createServerFn } from '@tanstack/react-start'
import { getAllUsersInteractor } from '../interactors/users'

export const getAllUsersFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    return getAllUsersInteractor()
  })
