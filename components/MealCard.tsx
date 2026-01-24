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
    <div
      className="flex-shrink-0 w-72 sm:w-80 min-w-[288px] sm:min-w-80 h-[380px] sm:h-[420px] rounded-xl p-4 sm:p-6 lg:p-8 card-hover cursor-pointer overflow-hidden relative group transition-all duration-300 touch-manipulation snap-center"
      style={{
        background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
        border: '1px solid rgba(110, 143, 61, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
      }}
    >
      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4 sm:mb-6">
          <span className="text-xs text-accent-primary font-semibold uppercase tracking-wider mb-2 sm:mb-4 inline-block">{time}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-2 sm:mt-4 mb-2 sm:mb-4 tracking-tight" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
            {meal}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary/90 leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-4 sm:pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={onVerCardapio}
            disabled={!cardapioId}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)] disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{
              background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
              color: '#E9EFEA',
              boxShadow: cardapioId ? '0 4px 16px rgba(110, 143, 61, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            Ver cardápio completo
          </button>
        </div>
      </div>
    </div>
  )
}
