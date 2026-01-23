'use client'

import { useState, useEffect } from 'react'

interface LoadingCardapioProps {
  progresso: number // 0-100
  etapa: string
}

export default function LoadingCardapio({ progresso, etapa }: LoadingCardapioProps) {
  const [alimentosAnimados, setAlimentosAnimados] = useState<string[]>([])
  
  const alimentos = [
    '🥑', '🥦', '🍅', '🥕', '🥬', '🥒', '🌶️', '🧄', '🧅',
    '🍌', '🍎', '🍊', '🍇', '🍓', '🥝', '🍉', '🍑',
    '🐟', '🍗', '🥚', '🥛', '🧀', '🥜', '🌰',
    '🍚', '🥖', '🌾', '🥔', '🍠', '🌽'
  ]

  useEffect(() => {
    // Animar alimentos aparecendo conforme o progresso
    const quantidade = Math.floor((progresso / 100) * alimentos.length)
    setAlimentosAnimados(alimentos.slice(0, quantidade))
  }, [progresso])

  const etapas = [
    { texto: 'Analisando suas necessidades...', emoji: '🔍' },
    { texto: 'Selecionando alimentos do Planeta Intestino...', emoji: '📚' },
    { texto: 'Montando café da manhã...', emoji: '☕' },
    { texto: 'Preparando almoços balanceados...', emoji: '🍽️' },
    { texto: 'Organizando lanches da tarde...', emoji: '🍎' },
    { texto: 'Criando jantares leves...', emoji: '🌙' },
    { texto: 'Personalizando quantidades...', emoji: '⚖️' },
    { texto: 'Finalizando seu cardápio...', emoji: '✨' },
  ]

  const etapaAtual = etapas[Math.floor((progresso / 100) * etapas.length)] || etapas[etapas.length - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-4xl mx-auto px-8">
        {/* Container principal */}
        <div className="bg-dark-secondary/98 backdrop-blur-sm border border-lilac/30 rounded-2xl p-12 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(199, 125, 255, 0.2)'
          }}
        >
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">
              Preparando seu Cardápio Personalizado
            </h2>
            <p className="text-xl text-text-secondary font-light">
              {etapaAtual.emoji} {etapaAtual.texto}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-neon-cyan">
                Progresso
              </span>
              <span className="text-lg font-bold text-neon-purple">
                {Math.round(progresso)}%
              </span>
            </div>
            <div className="w-full h-4 bg-dark-card rounded-full overflow-hidden border border-dark-border">
              <div 
                className="h-full bg-gradient-to-r from-neon-purple via-lilac to-neon-cyan transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progresso}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Alimentos animados */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <p className="text-base text-text-secondary font-light">
                Selecionando alimentos saudáveis para você...
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 min-h-[120px] items-center">
              {alimentos.map((alimento, index) => {
                const isVisible = index < alimentosAnimados.length
                return (
                  <div
                    key={index}
                    className={`text-5xl transition-all duration-500 ${
                      isVisible
                        ? 'opacity-100 scale-100 animate-bounce'
                        : 'opacity-20 scale-75'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: '1.5s',
                      filter: isVisible ? 'drop-shadow(0 0 8px rgba(199, 125, 255, 0.5))' : 'none'
                    }}
                  >
                    {alimento}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Etapas do processo */}
          <div className="space-y-3">
            {etapas.map((etapaItem, index) => {
              const etapaProgresso = (index + 1) * (100 / etapas.length)
              const isCompleta = progresso >= etapaProgresso
              const isAtual = progresso >= index * (100 / etapas.length) && progresso < etapaProgresso
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    isCompleta
                      ? 'border-neon-cyan/60 bg-dark-card'
                      : isAtual
                      ? 'border-neon-purple/60 bg-dark-card animate-pulse'
                      : 'border-dark-border bg-dark-secondary/50 opacity-60'
                  }`}
                  style={{
                    boxShadow: isCompleta || isAtual
                      ? '0 4px 16px rgba(199, 125, 255, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div className={`text-2xl ${isCompleta ? 'opacity-100' : isAtual ? 'opacity-100 animate-pulse' : 'opacity-40'}`}>
                    {isCompleta ? '✅' : isAtual ? '⏳' : '○'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base font-medium ${
                      isCompleta ? 'text-neon-cyan' : isAtual ? 'text-neon-purple' : 'text-text-secondary'
                    }`}>
                      {etapaItem.emoji} {etapaItem.texto}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
