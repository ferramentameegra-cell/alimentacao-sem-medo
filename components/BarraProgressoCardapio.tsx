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
      <div className="fixed top-0 left-0 right-0 z-50 bg-dark-secondary/95 backdrop-blur-md border-b border-lilac/30 shadow-lg animate-fade-in"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Ícone animado */}
            <div className="flex-shrink-0">
              {cardapioPronto ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center animate-pulse"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
                  }}
                >
                  <span className="text-2xl">✨</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-dark-card border-2 border-neon-purple/60 flex items-center justify-center animate-spin"
                  style={{
                    animationDuration: '2s',
                    boxShadow: '0 0 15px rgba(199, 125, 255, 0.4)'
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
                <span className="text-base font-bold text-neon-purple">
                  {Math.round(progresso)}%
                </span>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full h-2.5 bg-dark-card rounded-full overflow-hidden border border-dark-border">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple via-lilac to-neon-cyan transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progresso}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  {cardapioPronto && (
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan animate-pulse" />
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
                  '#C77DFF', // neon-purple
                  '#00F0FF', // neon-cyan
                  '#FF6B9D', // neon-pink
                  '#9D7FC7', // lilac
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
