import { auth } from '#/lib/auth.server'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return next({ context: { user: session.user, session: session.session } })
  },
)
