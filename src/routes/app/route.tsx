import { getSessionFn } from '#/lib/auth.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { user: session.user }
  },
})

function RouteComponent() {
  return <Outlet />
}
