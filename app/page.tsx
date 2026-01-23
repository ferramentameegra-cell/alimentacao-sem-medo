'use client'

import Sidebar from '@/components/Sidebar'
import Home from '@/components/Home'
import IntestineBackground from '@/components/IntestineBackground'

export default function Page() {
  // Página principal acessível sem autenticação
  // Login será exigido apenas ao adquirir um plano
  return (
    <main className="min-h-screen bg-dark-bg relative overflow-x-hidden w-full">
      <IntestineBackground />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 lg:ml-80 lg:max-w-[calc(100vw-320px)] w-full overflow-x-hidden">
          <Home />
        </div>
      </div>
    </main>
  )
}
