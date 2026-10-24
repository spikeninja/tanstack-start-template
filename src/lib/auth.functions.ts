import { auth } from '#/lib/auth.server'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => auth.api.getSession({ headers: getRequestHeaders() }),
)
