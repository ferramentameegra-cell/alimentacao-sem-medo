'use client'

import Sidebar from '@/components/Sidebar'
import Home from '@/components/Home'
import IntestineBackground from '@/components/IntestineBackground'

export default function Page() {
  // Página principal acessível sem autenticação
  // Login será exigido apenas ao adquirir um plano
  return (
    <main className="min-h-screen relative overflow-x-hidden w-full"
      style={{
        minHeight: '-webkit-fill-available', /* iOS Safari */
        paddingTop: 'env(safe-area-inset-top, 0)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)'
      }}
    >
      <IntestineBackground />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 lg:ml-80 lg:max-w-[calc(100vw-320px)] w-full overflow-x-hidden"
          style={{
            maxWidth: '100vw',
            width: '100%'
          }}
        >
          <Home />
        </div>
      </div>
    </main>
  )
}
