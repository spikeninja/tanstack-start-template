import { getSessionFn } from '#/lib/auth.functions'
import { queryOptions } from '@tanstack/react-query'

export const sessionQueryOptions = queryOptions({
  queryKey: ['auth', 'session'],
  queryFn: () => getSessionFn(),
  staleTime: 60_000,
})
