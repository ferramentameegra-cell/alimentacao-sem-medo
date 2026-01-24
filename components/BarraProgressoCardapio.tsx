'use client'

import { useEffect, useState } from 'react'

interface BarraProgressoCardapioProps {
  progresso: number // 0-100
  etapa: string
  mostrar: boolean
  onCompleto?: () => void
}

export default function BarraProgressoCardapio({ 
  progresso, 
  etapa, 
  mostrar,
  onCompleto 
}: BarraProgressoCardapioProps) {
  const [mostrarConfetes, setMostrarConfetes] = useState(false)
  const [cardapioPronto, setCardapioPronto] = useState(false)

  useEffect(() => {
    if (progresso >= 100 && !cardapioPronto) {
      setCardapioPronto(true)
      setMostrarConfetes(true)
      
      // Parar confetes após 3 segundos
      setTimeout(() => {
        setMostrarConfetes(false)
        if (onCompleto) {
          setTimeout(() => onCompleto(), 1000)
        }
      }, 3000)
    }
  }, [progresso, cardapioPronto, onCompleto])

  if (!mostrar) return null

  return (
    <>
      {/* Barra de progresso fixa no topo */}
      <div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b animate-fade-in"
        style={{
          background: 'rgba(15, 46, 43, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Ícone animado */}
            <div className="flex-shrink-0">
              {cardapioPronto ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-primary/80 flex items-center justify-center animate-pulse"
                  style={{
                    boxShadow: '0 0 20px rgba(110, 143, 61, 0.6)'
                  }}
                >
                  <span className="text-2xl">✨</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-bg-secondary border-2 border-accent-primary/60 flex items-center justify-center animate-spin"
                  style={{
                    animationDuration: '2s',
                    boxShadow: '0 0 15px rgba(110, 143, 61, 0.4)'
                  }}
                >
                  <span className="text-xl">🍽️</span>
                </div>
              )}
            </div>

            {/* Texto e progresso */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-semibold text-text-primary">
                  {cardapioPronto 
                    ? '🎉 Seu cardápio está pronto!' 
                    : progresso >= 90
                    ? '✨ Seu cardápio está quase pronto...'
                    : etapa || 'Preparando seu cardápio...'}
                </p>
                <span className="text-base font-bold text-accent-primary">
                  {Math.round(progresso)}%
                </span>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden border border-accent-secondary/30">
                <div 
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-primary/80 transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progresso}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  {cardapioPronto && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary via-accent-primary to-accent-secondary animate-pulse opacity-80" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetes quando completar */}
      {mostrarConfetes && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confete"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: [
                  '#6E8F3D', // accent-primary
                  '#4F6B58', // accent-secondary
                  '#7FA04A', // accent-primary light
                  '#5A7A6A', // accent-secondary light
                ][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                boxShadow: '0 0 10px currentColor',
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
