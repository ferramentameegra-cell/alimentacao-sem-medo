'use client'

interface MealCardProps {
  meal: string
  time: string
  description: string
  cardapioId?: string | null
  diaSemana?: number
  tipoRefeicao?: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  onVerCardapio?: () => void
}

export default function MealCard({ meal, time, description, cardapioId, diaSemana, tipoRefeicao, onVerCardapio }: MealCardProps) {
  return (
    <div className="flex-shrink-0 w-72 sm:w-80 min-w-[288px] sm:min-w-80 h-[380px] sm:h-[420px] rounded-xl bg-dark-card border border-dark-border p-4 sm:p-6 lg:p-8 card-hover cursor-pointer overflow-hidden relative group transition-all duration-300 touch-manipulation snap-center"
      style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4 sm:mb-6">
          <span className="text-xs text-neon-cyan font-semibold uppercase tracking-wider mb-2 sm:mb-4 inline-block">{time}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-2 sm:mt-4 mb-2 sm:mb-4 tracking-tight">
            {meal}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-4 sm:pt-6 border-t border-dark-border">
          <button 
            onClick={onVerCardapio}
            disabled={!cardapioId}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-6 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{
              boxShadow: cardapioId ? '0 4px 16px rgba(199, 125, 255, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            Ver cardápio completo
          </button>
        </div>
      </div>
    </div>
  )
}
