'use client'

import MontarCardapio from '@/components/MontarCardapio'
import Sidebar from '@/components/Sidebar'
import IntestineBackground from '@/components/IntestineBackground'

export default function MontarCardapioPage() {
  return (
    <main className="min-h-screen bg-dark-bg relative overflow-x-hidden w-full">
      <IntestineBackground />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 ml-80 max-w-[calc(100vw-320px)] overflow-x-hidden">
          <MontarCardapio />
        </div>
      </div>
    </main>
  )
}
