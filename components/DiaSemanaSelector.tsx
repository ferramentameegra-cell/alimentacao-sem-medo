'use client'

interface DiaSemanaSelectorProps {
  selectedDay: number
  onSelectDay: (day: number) => void
}

export default function DiaSemanaSelector({ selectedDay, onSelectDay }: DiaSemanaSelectorProps) {
  const diasSemana = [
    { numero: 0, nome: 'Domingo', abreviacao: 'Dom' },
    { numero: 1, nome: 'Segunda', abreviacao: 'Seg' },
    { numero: 2, nome: 'Terça', abreviacao: 'Ter' },
    { numero: 3, nome: 'Quarta', abreviacao: 'Qua' },
    { numero: 4, nome: 'Quinta', abreviacao: 'Qui' },
    { numero: 5, nome: 'Sexta', abreviacao: 'Sex' },
    { numero: 6, nome: 'Sábado', abreviacao: 'Sáb' },
  ]

  // Obter dia atual em Brasília
  const hoje = new Date()
  const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const diaAtual = dataBrasilia.getDay()

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
      {diasSemana.map((dia) => {
        const isToday = dia.numero === diaAtual
        const isSelected = dia.numero === selectedDay
        
        return (
          <button
            key={dia.numero}
            onClick={() => onSelectDay(dia.numero)}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border transition-all duration-300 touch-manipulation snap-center min-w-[100px] sm:min-w-[120px] card-hover ${isSelected ? 'scale-105' : ''}`}
            style={{
              background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
              border: `1px solid ${isSelected ? 'rgba(110, 143, 61, 0.4)' : 'rgba(110, 143, 61, 0.25)'}`,
              boxShadow: isSelected
                ? '0 0 0 1px rgba(110, 143, 61, 0.4), 0 0 25px rgba(110, 143, 61, 0.25), 0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                : '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="text-center">
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${isToday ? 'text-accent-primary' : 'text-text-secondary/90'}`}>
                {isToday ? 'Hoje' : dia.abreviacao}
              </div>
              <div className={`text-base sm:text-lg font-bold ${isSelected ? 'text-accent-primary' : 'text-text-primary'}`} style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
                {dia.nome}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
