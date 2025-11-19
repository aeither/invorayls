import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import BottomNavigation from '../components/BottomNavigation'
import { Lock } from 'lucide-react'

interface MarketService {
  id: string
  name: string
  icon: string
  color: string
}

const services: MarketService[] = [
  { id: '1', name: 'Paid Research', icon: '📊', color: 'hsl(var(--celo-blue))' },
  { id: '2', name: 'Paid Alpha', icon: '💎', color: 'hsl(var(--celo-yellow))' },
  { id: '3', name: 'Wallet Risk Analytics', icon: '🛡️', color: 'hsl(var(--celo-green))' },
  { id: '4', name: 'Image Generation', icon: '🎨', color: 'hsl(var(--celo-pink))' },
  { id: '5', name: 'NFT Drop', icon: '🎁', color: 'hsl(var(--celo-purple))' },
  { id: '6', name: 'Egg Raffle', icon: '🥚', color: 'hsl(var(--celo-yellow))' },
  { id: '7', name: 'Exclusive Item', icon: '⭐', color: 'hsl(var(--celo-blue))' },
  { id: '8', name: 'Skins', icon: '🎭', color: 'hsl(var(--celo-pink))' },
  { id: '9', name: 'Discounts', icon: '🏷️', color: 'hsl(var(--celo-green))' },
  { id: '10', name: 'Meme Generator', icon: '😂', color: 'hsl(var(--celo-yellow))' },
  { id: '11', name: 'Quiz Generator', icon: '❓', color: 'hsl(var(--celo-purple))' },
]

function ServiceCard({ service, locked = true }: { service: MarketService; locked?: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.05 }}
      style={{
        width: '160px',
        height: '160px',
        flexShrink: 0,
        marginRight: '1.5rem',
        background: locked ? 'rgba(0, 0, 0, 0.15)' : service.color,
        border: '3px solid hsl(var(--celo-black))',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
    >
      <div style={{
        fontSize: '3rem',
        marginBottom: '0.5rem',
        filter: locked ? 'grayscale(0.6)' : 'none',
        opacity: locked ? 0.7 : 1,
      }}>
        {service.icon}
      </div>
      <div className="text-body-heavy" style={{
        fontSize: '0.75rem',
        color: 'hsl(var(--celo-black))',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '0 0.5rem',
        opacity: locked ? 0.75 : 1,
        fontWeight: locked ? 'var(--font-weight-body-heavy)' : 'var(--font-weight-body-black)',
      }}>
        {service.name}
      </div>

      {locked && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'hsl(var(--celo-yellow))',
            border: '2px solid hsl(var(--celo-black))',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={24} strokeWidth={3} color="hsl(var(--celo-black))" />
        </motion.div>
      )}
    </motion.div>
  )
}

function ScrollingRow({ services, direction, delay = 0 }: { services: MarketService[]; direction: 'left' | 'right'; delay?: number }) {
  const duplicatedServices = [...services, ...services, ...services]

  return (
    <div style={{
      overflow: 'hidden',
      width: '100%',
      marginBottom: '1.5rem',
    }}>
      <motion.div
        animate={{
          x: direction === 'right' ? ['0%', '-33.33%'] : ['-33.33%', '0%']
        }}
        transition={{
          x: {
            repeat: Infinity,
            duration: 20,
            ease: 'linear',
            delay,
          }
        }}
        style={{
          display: 'flex',
          width: 'fit-content',
        }}
      >
        {duplicatedServices.map((service, idx) => (
          <ServiceCard key={`${service.id}-${idx}`} service={service} />
        ))}
      </motion.div>
    </div>
  )
}

function MarketPage() {
  const row1 = services.slice(0, 4)
  const row2 = services.slice(4, 8)
  const row3 = services.slice(8, 11)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        paddingBottom: '70px',
        background: 'hsl(var(--background))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background with low opacity pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: `
          repeating-linear-gradient(45deg, hsl(var(--celo-black)) 0px, hsl(var(--celo-black)) 10px, transparent 10px, transparent 20px),
          repeating-linear-gradient(-45deg, hsl(var(--celo-black)) 0px, hsl(var(--celo-black)) 10px, transparent 10px, transparent 20px)
        `,
        pointerEvents: 'none',
      }} />

      <div style={{
        padding: '2rem 0',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '0 2rem',
        }}>
          <div style={{
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            marginBottom: '1rem'
          }}>
            🏪
          </div>

          <h1 className="text-headline-thin" style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            color: 'hsl(var(--celo-black))',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            lineHeight: '1',
            opacity: 0.9,
          }}>
            Coming <span style={{ fontStyle: 'italic' }}>Soon</span>
          </h1>

          <div style={{
            position: 'relative',
            display: 'inline-block',
          }}>
            <p className="text-body-heavy" style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
              color: 'hsl(var(--celo-brown))',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              opacity: 0.85,
            }}>
              The marketplace is under construction
            </p>
          </div>
        </div>

        {/* Scrolling Rows */}
        <div style={{
          marginTop: '2rem',
        }}>
          <ScrollingRow services={row1} direction="right" delay={0} />
          <ScrollingRow services={row2} direction="left" delay={0.5} />
          <ScrollingRow services={row3} direction="right" delay={1} />
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  )
}

export const Route = createFileRoute('/market')({
  component: MarketPage,
})
