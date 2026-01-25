'use client'

import { Suspense } from 'react'
import MontarCardapio from '@/components/MontarCardapio'
import Sidebar from '@/components/Sidebar'
import IntestineBackground from '@/components/IntestineBackground'

export default function MontarCardapioPage() {
  return (
    <main className="min-h-screen bg-dark-bg relative overflow-x-hidden w-full">
      <IntestineBackground />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 lg:ml-80 lg:max-w-[calc(100vw-320px)] w-full overflow-x-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="inline-flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-accent-primary animate-bounce" style={{ boxShadow: '0 0 12px rgba(110, 143, 61, 0.4)' }} />
                  <div className="w-3 h-3 rounded-full bg-accent-secondary animate-bounce" style={{ animationDelay: '0.2s', boxShadow: '0 0 12px rgba(79, 107, 88, 0.4)' }} />
                  <div className="w-3 h-3 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '0.4s', boxShadow: '0 0 12px rgba(110, 143, 61, 0.4)' }} />
                </div>
                <p className="text-text-secondary">Carregando...</p>
              </div>
            </div>
          }>
            <MontarCardapio />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
