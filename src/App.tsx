import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'
import { routeTree } from './routeTree.gen'
import { config } from './wagmi'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Get cookie state for wallet persistence
  const cookie = typeof document !== 'undefined' ? document.cookie : ''
  const initialState = cookie ? cookieToInitialState(config, cookie) : undefined

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <RouterProvider router={router} />
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              },
            }}
          />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
