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
            className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border transition-all duration-300 touch-manipulation snap-center min-w-[100px] sm:min-w-[120px] ${
              isSelected
                ? 'border-neon-purple/60 bg-gradient-to-br from-dark-card to-dark-tertiary shadow-neon-purple scale-105'
                : 'border-dark-border bg-dark-card active:border-lilac/40 active:scale-102'
            } ${isToday && !isSelected ? 'border-neon-cyan/40' : ''}`}
            style={{
              boxShadow: isSelected 
                ? '0 8px 32px rgba(199, 125, 255, 0.3), 0 0 0 1px rgba(199, 125, 255, 0.2)'
                : isToday
                ? '0 4px 16px rgba(0, 240, 255, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="text-center">
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${isToday ? 'text-neon-cyan' : 'text-text-secondary'}`}>
                {isToday ? 'Hoje' : dia.abreviacao}
              </div>
              <div className={`text-base sm:text-lg font-bold ${isSelected ? 'text-neon-purple' : 'text-text-primary'}`}>
                {dia.nome}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
