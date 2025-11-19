import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import BottomNavigation from '../components/BottomNavigation';

function LandingPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'business' | 'investor') => {
    navigate({ to: `/${role}` });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: 'hsl(var(--background))',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '1rem',
          paddingTop: 'clamp(2rem, 8vw, 4rem)',
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            📄
          </motion.div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              margin: 0,
              marginBottom: '1rem',
              fontWeight: 'bold',
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Invorayls
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: 'hsl(var(--celo-brown))',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            A regulated real-world asset tokenization platform for invoice
            financing, powered by blockchain technology and ERC-3643 compliance.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div
            style={{
              background: 'hsl(var(--celo-yellow))',
              border: '3px solid hsl(var(--celo-black))',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🔗 Connect Your Wallet
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              Connect your wallet using the button in the top right to get
              started.
            </div>
          </div>
        )}

        {/* Role Selection Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Business Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('business')}
            style={{
              background: 'hsl(var(--celo-white))',
              border: '3px solid hsl(var(--celo-black))',
              padding: '2rem',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'hsl(var(--celo-purple))',
              }}
            />

            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              📄
            </div>

            <h3
              style={{
                fontSize: '1.5rem',
                margin: 0,
                marginBottom: '0.75rem',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Business User
            </h3>

            <p
              style={{
                color: 'hsl(var(--celo-brown))',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              Tokenize your invoices and access early payment
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: '1.5rem',
              }}
            >
              {[
                'Upload and tokenize invoices',
                'Receive early payments',
                'Track invoice status',
                'KYC-verified transactions',
              ].map((feature, i) => (
                <li
                  key={i}
                  style={{
                    padding: '0.5rem 0',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: 'hsl(var(--celo-green))' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div
              style={{
                padding: '0.75rem',
                background: 'hsl(var(--celo-purple))',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '2px solid hsl(var(--celo-black))',
                textTransform: 'uppercase',
              }}
            >
              Enter Dashboard →
            </div>
          </motion.div>

          {/* Investor Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('investor')}
            style={{
              background: 'hsl(var(--celo-white))',
              border: '3px solid hsl(var(--celo-black))',
              padding: '2rem',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'hsl(var(--celo-green))',
              }}
            />

            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              💰
            </div>

            <h3
              style={{
                fontSize: '1.5rem',
                margin: 0,
                marginBottom: '0.75rem',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Investor
            </h3>

            <p
              style={{
                color: 'hsl(var(--celo-brown))',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              Provide liquidity and earn returns on invoice financing
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: '1.5rem',
              }}
            >
              {[
                'Deposit USDC to earn yield',
                'ERC-4626 compliant vault',
                'Transparent on-chain tracking',
                'Regulated RWA investment',
              ].map((feature, i) => (
                <li
                  key={i}
                  style={{
                    padding: '0.5rem 0',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: 'hsl(var(--celo-green))' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div
              style={{
                padding: '0.75rem',
                background: 'hsl(var(--celo-green))',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '2px solid hsl(var(--celo-black))',
                textTransform: 'uppercase',
              }}
            >
              Enter Dashboard →
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div
          style={{
            background: 'hsl(var(--celo-white))',
            border: '3px solid hsl(var(--celo-black))',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              margin: 0,
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Platform Features
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                icon: '🔒',
                title: 'KYC Compliant',
                description: 'ERC-3643 style identity verification',
              },
              {
                icon: '📊',
                title: 'ERC-4626 Vault',
                description: 'Standard compliant liquidity pool',
              },
              {
                icon: '🏦',
                title: 'Real Assets',
                description: 'Invoices as ERC-721 NFTs',
              },
              {
                icon: '⛓️',
                title: 'On-Chain',
                description: 'Transparent and immutable',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'hsl(var(--celo-tan-2))',
                  border: '2px solid hsl(var(--celo-black))',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {feature.icon}
                </div>
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'hsl(var(--celo-brown))',
                  }}
                >
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div
          style={{
            background: 'hsl(var(--celo-white))',
            border: '3px solid hsl(var(--celo-black))',
            padding: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              margin: 0,
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                step: 1,
                title: 'KYC Verification',
                description:
                  'Both businesses and investors complete identity verification',
              },
              {
                step: 2,
                title: 'Tokenize Invoices',
                description:
                  'Businesses mint invoice NFTs with amount and due date',
              },
              {
                step: 3,
                title: 'Provide Liquidity',
                description:
                  'Investors deposit USDC into the vault to fund invoices',
              },
              {
                step: 4,
                title: 'Earn Returns',
                description:
                  'As invoices are paid, investors earn yield on their capital',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  position: 'relative',
                  padding: '1rem',
                  paddingTop: '2.5rem',
                  background: 'hsl(var(--celo-tan-2))',
                  border: '2px solid hsl(var(--celo-black))',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '1rem',
                    width: '32px',
                    height: '32px',
                    background: 'hsl(var(--celo-purple))',
                    color: 'white',
                    border: '2px solid hsl(var(--celo-black))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'hsl(var(--celo-brown))',
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  );
}

export const Route = createFileRoute('/')({
  component: LandingPage,
});
