import { createServerFn } from '@tanstack/react-start'
import { getAllUsersInteractor } from '../interactors/users'

export const getAllUsersFn = createServerFn().handler(async () => {
  return getAllUsersInteractor()
})
