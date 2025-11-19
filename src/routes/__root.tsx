import { createRootRoute, Outlet } from '@tanstack/react-router'
import GlobalHeader from '../components/GlobalHeader'
import BottomNavigation from '../components/BottomNavigation'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col relative bg-[radial-gradient(circle_at_top_left,hsl(var(--glass-bg-start)),hsl(var(--glass-bg-end)))]">
      <GlobalHeader />

      <main className="flex-1 relative pt-24 pb-28 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      <BottomNavigation />
    </div>
  ),
})