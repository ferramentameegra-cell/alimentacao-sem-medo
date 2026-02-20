'use client'

import { useState, useEffect } from 'react'
import { calcularMetaAgua, formatarAgua, calcularProgresso, DadosUsuarioAgua } from '@/lib/calculadora_agua'

interface MetaAguaProps {
  dadosUsuario?: DadosUsuarioAgua
  className?: string
  compacto?: boolean // Modo compacto e discreto
  sidebar?: boolean // Modo para sidebar (ainda mais compacto)
}

export default function MetaAgua({ dadosUsuario, className = '', compacto = false, sidebar = false }: MetaAguaProps) {
  const [consumidoHoje, setConsumidoHoje] = useState(0)
  const [meta, setMeta] = useState(2000) // Default 2L
  const [carregando, setCarregando] = useState(true)
  const [adicionando, setAdicionando] = useState(false)

  // Calcular meta baseada nos dados do usuário
  useEffect(() => {
    if (dadosUsuario && dadosUsuario.peso && dadosUsuario.altura) {
      const metaCalculada = calcularMetaAgua(dadosUsuario)
      setMeta(metaCalculada)
    }
  }, [dadosUsuario])

  // Carregar progresso do dia atual
  useEffect(() => {
    const carregarProgresso = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        const userEmail = localStorage.getItem('userEmail')
        
        if (sessionId || userEmail) {
          const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
          
          const response = await fetch(`/api/agua/progresso?data=${hoje}`, {
            headers: {
              'X-Session-Id': sessionId || '',
              'X-User-Email': userEmail || '',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.consumido !== undefined) {
              setConsumidoHoje(data.consumido)
            }
            if (data.meta) {
              setMeta(data.meta)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar progresso de água:', error)
      } finally {
        setCarregando(false)
      }
    }
    
    carregarProgresso()
  }, [])

  const progresso = calcularProgresso(consumidoHoje, meta)
  const falta = Math.max(0, meta - consumidoHoje)

  const adicionarAgua = async (quantidade: number) => {
    if (adicionando) return
    
    setAdicionando(true)
    
    try {
      const sessionId = localStorage.getItem('sessionId')
      const userEmail = localStorage.getItem('userEmail')
      const hoje = new Date().toISOString().split('T')[0]
      
      const novoConsumido = consumidoHoje + quantidade
      
      const response = await fetch('/api/agua/progresso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId || '',
          'X-User-Email': userEmail || '',
        },
        body: JSON.stringify({
          data: hoje,
          consumido: novoConsumido,
          meta: meta,
        }),
      })
      
      if (response.ok) {
        setConsumidoHoje(novoConsumido)
      } else {
        console.error('Erro ao salvar progresso de água')
      }
    } catch (error) {
      console.error('Erro ao adicionar água:', error)
    } finally {
      setAdicionando(false)
    }
  }

  if (carregando) {
    return (
      <div className={`bg-dark-secondary/50 border border-dark-border/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Modo sidebar (mais compacto e moderno)
  if (sidebar) {
    const precisaLembrete = progresso < 100
    return (
      <div
        className={`bg-gradient-to-br from-dark-card/60 to-dark-secondary/40 border border-cyan-500/20 rounded-xl p-3 sm:p-4 ${className} ${precisaLembrete ? 'animate-agua-reminder' : ''}`}
        style={{
          boxShadow: '0 4px 16px rgba(6, 182, 212, 0.15)',
        }}
      >
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-cyan-400 mb-1.5 tracking-tight">
            💧 Hidratação Diária
          </h3>
          <p className="text-xs text-text-secondary font-medium">
            {formatarAgua(consumidoHoje)} / {formatarAgua(meta)}
          </p>
          {precisaLembrete && (
            <p className="text-xs text-cyan-400/90 mt-1">
              Beba água! 💧
            </p>
          )}
        </div>

        {/* Copo moderno e compacto */}
        <div className="relative mb-3">
          <div className="mx-auto w-20 h-40 bg-dark-card/30 border-2 border-cyan-500/30 rounded-b-2xl overflow-hidden relative backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.1)'
            }}
          >
            {/* Água dentro do copo com efeito moderno */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400 transition-all duration-700 ease-out"
              style={{
                height: `${progresso}%`,
                boxShadow: progresso > 0 
                  ? '0 -4px 16px rgba(6, 182, 212, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)' 
                  : 'none',
              }}
            >
              {/* Efeito de ondas na superfície */}
              {progresso > 0 && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-cyan-300/60 to-transparent animate-pulse" />
              )}
            </div>

            {/* Indicador de progresso moderno */}
            <div className="absolute top-1.5 left-1.5 right-1.5 text-center pointer-events-none">
              <div className="text-sm font-bold text-cyan-300 drop-shadow-lg">
                {progresso}%
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem motivacional compacta */}
        {progresso >= 100 && (
          <div className="text-center mb-2">
            <p className="text-xs font-semibold text-cyan-400">🎉 Meta atingida!</p>
          </div>
        )}

        {/* Botões modernos e compactos */}
        <div className="grid grid-cols-3 gap-1.5">
          {[200, 300, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => adicionarAgua(ml)}
              disabled={adicionando || consumidoHoje >= meta}
              className="px-2 py-2 bg-dark-card/50 border border-cyan-500/20 rounded-lg text-xs font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              style={{
                boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)'
              }}
            >
              +{ml}
            </button>
          ))}
        </div>

        {/* Input customizado compacto */}
        {falta > 0 && (
          <div className="mt-2 flex gap-1.5">
            <input
              type="number"
              min="0"
              max={falta}
              step="50"
              placeholder="ml"
              className="flex-1 px-2 py-1.5 bg-dark-card/50 border border-cyan-500/20 rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget
                  const quantidade = parseInt(input.value)
                  if (quantidade > 0 && quantidade <= falta) {
                    adicionarAgua(quantidade)
                    input.value = ''
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                const quantidade = parseInt(input.value)
                if (quantidade > 0 && quantidade <= falta) {
                  adicionarAgua(quantidade)
                  input.value = ''
                }
              }}
              disabled={adicionando || consumidoHoje >= meta}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-xs font-semibold hover:from-cyan-500 hover:to-cyan-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              +
            </button>
          </div>
        )}
      </div>
    )
  }

  // Modo compacto e discreto (para Home)
  if (compacto) {
    const precisaLembreteCompacto = progresso < 100
    return (
      <div className={`bg-dark-secondary/50 border border-dark-border/50 rounded-lg p-3 sm:p-4 ${className} ${precisaLembreteCompacto ? 'animate-agua-reminder' : ''}`}>
        <div className="text-center mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-text-secondary mb-1">
            💧 Hidratação
          </h3>
          <p className="text-xs text-text-muted">
            {formatarAgua(consumidoHoje)} / {formatarAgua(meta)}
          </p>
        </div>

        {/* Copo compacto */}
        <div className="relative mb-3">
          <div className="mx-auto w-16 sm:w-20 h-32 sm:h-40 bg-dark-card/50 border-2 border-dark-border/50 rounded-b-2xl overflow-hidden relative"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Água dentro do copo */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600/80 via-cyan-500/80 to-cyan-400/80 transition-all duration-500 ease-out"
              style={{
                height: `${progresso}%`,
                boxShadow: progresso > 0 ? '0 -2px 10px rgba(6, 182, 212, 0.3)' : 'none',
              }}
            >
              {progresso > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-cyan-300/40 to-transparent" />
              )}
            </div>

            {/* Indicador de progresso compacto */}
            <div className="absolute top-1 left-1 right-1 text-center pointer-events-none">
              <div className="text-xs sm:text-sm font-bold text-text-primary/90 drop-shadow">
                {progresso}%
              </div>
            </div>
          </div>
        </div>

        {/* Botões compactos */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[200, 300, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => adicionarAgua(ml)}
              disabled={adicionando || consumidoHoje >= meta}
              className="px-2 py-1.5 sm:py-2 bg-dark-card/50 border border-dark-border/50 rounded text-xs font-medium text-text-secondary hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              +{ml}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Modo completo (original)
  return (
    <div className={`bg-dark-secondary border border-dark-border rounded-xl p-4 sm:p-6 ${className}`}>
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
          Meta de Água Diária
        </h3>
        <p className="text-sm sm:text-base text-text-secondary">
          {formatarAgua(consumidoHoje)} / {formatarAgua(meta)}
        </p>
      </div>

      {/* Visual do Copo */}
      <div className="relative mb-6 sm:mb-8">
        <div className="mx-auto w-32 sm:w-40 h-64 sm:h-80 bg-dark-card border-4 border-dark-border rounded-b-3xl overflow-hidden relative"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Água dentro do copo */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400 transition-all duration-500 ease-out"
            style={{
              height: `${progresso}%`,
              boxShadow: progresso > 0 ? '0 -4px 20px rgba(6, 182, 212, 0.5)' : 'none',
            }}
          >
            {/* Efeito de ondas na superfície */}
            {progresso > 0 && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-cyan-300/50 to-transparent animate-pulse" />
            )}
          </div>

          {/* Marcações no copo */}
          <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
            {[100, 75, 50, 25, 0].map((percent) => (
              <div
                key={percent}
                className="flex items-center"
                style={{ height: `${100 / 4}%` }}
              >
                <div className="w-full h-px bg-dark-border/30" />
                <span className="ml-2 text-xs text-text-secondary">
                  {formatarAgua(Math.round((meta * percent) / 100))}
                </span>
              </div>
            ))}
          </div>

          {/* Indicador de progresso */}
          <div className="absolute top-2 left-2 right-2 text-center pointer-events-none">
            <div className="text-2xl sm:text-3xl font-bold text-text-primary drop-shadow-lg">
              {progresso}%
            </div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        {progresso >= 100 && (
          <div className="mt-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm sm:text-base font-semibold text-neon-cyan">
              Parabéns! Meta atingida!
            </p>
          </div>
        )}
        {progresso < 50 && progresso > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm sm:text-base text-text-secondary">
              Continue assim! 💪
            </p>
          </div>
        )}
        {progresso === 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm sm:text-base text-text-secondary">
              Comece a beber água! 💧
            </p>
          </div>
        )}
      </div>

      {/* Botões para adicionar água */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[200, 300, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => adicionarAgua(ml)}
              disabled={adicionando || consumidoHoje >= meta}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base font-semibold text-text-primary hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              +{ml}ml
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[1000, 1500].map((ml) => (
            <button
              key={ml}
              onClick={() => adicionarAgua(ml)}
              disabled={adicionando || consumidoHoje >= meta}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base font-semibold text-text-primary hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              +{formatarAgua(ml)}
            </button>
          ))}
        </div>

        {/* Input customizado */}
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max={falta}
            step="50"
            placeholder="Quantidade (ml)"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget
                const quantidade = parseInt(input.value)
                if (quantidade > 0 && quantidade <= falta) {
                  adicionarAgua(quantidade)
                  input.value = ''
                }
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              const quantidade = parseInt(input.value)
              if (quantidade > 0 && quantidade <= falta) {
                adicionarAgua(quantidade)
                input.value = ''
              }
            }}
            disabled={adicionando || consumidoHoje >= meta}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Informação adicional */}
      {falta > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-border text-center">
          <p className="text-xs sm:text-sm text-text-secondary">
            Faltam {formatarAgua(falta)} para atingir a meta
          </p>
        </div>
      )}
    </div>
  )
}
