import { sessionQueryOptions } from '#/queries/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(sessionQueryOptions)

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { user: session.user }
  },
})

function RouteComponent() {
  return <Outlet />
}
