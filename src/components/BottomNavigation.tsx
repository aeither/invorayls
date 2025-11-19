import { useNavigate, useLocation } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Home, Briefcase, TrendingUp } from 'lucide-react'

export default function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/'
    },
    {
      id: 'business',
      label: 'Business',
      icon: Briefcase,
      path: '/business'
    },
    {
      id: 'investor',
      label: 'Investor',
      icon: TrendingUp,
      path: '/investor'
    }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="glass-panel px-2 py-2 flex items-center gap-2 pointer-events-auto shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className="relative group flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300"
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/10 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors duration-300 ${active ? 'text-cyan-300' : 'text-white/50 group-hover:text-white/80'}`}>
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-all duration-300 ${active ? 'drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]' : ''}`}
                />
                <span className="text-[10px] font-medium tracking-wide uppercase">
                  {item.label}
                </span>
              </div>

              {active && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
