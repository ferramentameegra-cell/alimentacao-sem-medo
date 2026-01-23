'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IntestineBackground from '@/components/IntestineBackground'

export default function PlanosPage() {
  const router = useRouter()
  const [planoAtual, setPlanoAtual] = useState<1 | 2 | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const verificarPlano = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        const userEmail = localStorage.getItem('userEmail')
        
        if (sessionId || userEmail) {
          // Tentar verificar sessão
          let response = sessionId ? await fetch('/api/auth/session', {
            headers: {
              'X-Session-Id': sessionId,
              'X-User-Email': userEmail || '',
            },
          }) : null
          
          // Se sessão inválida mas tem email, tentar reautenticar
          if (!response || !response.ok) {
            if (userEmail) {
              try {
                const loginResponse = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    email: userEmail, 
                    senha: '12345678'
                  }),
                })
                
                if (loginResponse.ok) {
                  const loginData = await loginResponse.json()
                  if (loginData.sessionId) {
                    localStorage.setItem('sessionId', loginData.sessionId)
                    response = await fetch('/api/auth/session', {
                      headers: {
                        'X-Session-Id': loginData.sessionId,
                        'X-User-Email': userEmail,
                      },
                    })
                  }
                }
              } catch (e) {
                // Ignorar erro
              }
            }
          }
          
          if (response && response.ok) {
            const data = await response.json()
            if (data.conta && data.conta.plano) {
              // Se já tem plano, redirecionar imediatamente para home
              console.log('✅ Usuário já tem plano ativo:', data.conta.plano, '- Redirecionando para home')
              router.push('/')
              return
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar plano:', error)
      } finally {
        setCarregando(false)
      }
    }

    verificarPlano()
  }, [router])

  const handleSelecionarPlano = async (plano: 1 | 2) => {
    try {
      const sessionId = localStorage.getItem('sessionId')
      
      // Se não tem sessão, redirecionar para criar conta
      if (!sessionId) {
        router.push(`/criar-conta?plano=${plano}`)
        return
      }

      // Verificar se a sessão é válida
      const sessionResponse = await fetch('/api/auth/session', {
        headers: {
          'X-Session-Id': sessionId,
        },
      })

      if (!sessionResponse.ok) {
        // Sessão inválida, redirecionar para criar conta
        router.push(`/criar-conta?plano=${plano}`)
        return
      }

      // Atualizar plano na conta
      const response = await fetch('/api/planos/selecionar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({ plano }),
      })

      if (response.ok) {
        // Verificar se há dados de cardápio pendente
        const dadosPendentes = localStorage.getItem('dadosCardapioPendente')
        
        if (dadosPendentes) {
          // Redirecionar para /montar-cardapio que vai gerar automaticamente
          router.push('/montar-cardapio')
        } else {
          // Se não tem dados pendentes, redirecionar para montar cardápio
          router.push('/montar-cardapio')
        }
      } else {
        alert('Erro ao selecionar plano. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao selecionar plano:', error)
      alert('Erro ao selecionar plano. Tente novamente.')
    }
  }

  const handleUpgrade = async () => {
    await handleSelecionarPlano(2)
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <IntestineBackground />
      
      <div className="relative z-10 min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight text-text-primary">
              Escolha seu Plano
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary font-light">
              Acesso completo à plataforma de alimentação sem medo
            </p>
          </div>

          {/* Comparação de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* PLANO 1 - Inteligente */}
            <div className={`bg-dark-secondary border-2 rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 ${
              planoAtual === 1 
                ? 'border-lilac/60 shadow-neon-purple' 
                : 'border-dark-border hover:border-lilac/40'
            }`}
              style={{
                boxShadow: planoAtual === 1 
                  ? '0 8px 32px rgba(199, 125, 255, 0.3)' 
                  : '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  Plano Inteligente
                </h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neon-cyan">R$ 67</span>
                  <span className="text-lg sm:text-xl text-text-secondary">/mês</span>
                </div>
                {planoAtual === 1 && (
                  <div className="inline-block px-4 py-2 bg-lilac/20 border border-lilac/40 rounded-lg mb-4">
                    <span className="text-sm font-semibold text-lilac">Seu plano atual</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Geração automática de cardápios semanais personalizados
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Perfil evolutivo do paciente (histórico, preferências, restrições e progresso)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Ajustes automáticos do cardápio conforme evolução
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Acesso total à plataforma
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg sm:text-xl text-text-muted">✗</span>
                  <span className="text-base sm:text-lg text-text-muted leading-relaxed line-through">
                    Sem acompanhamento humano
                  </span>
                </li>
              </ul>

              {planoAtual === 1 ? (
                <button
                  onClick={handleUpgrade}
                  className="w-full py-4 sm:py-5 px-4 sm:px-6 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 shadow-neon-purple hover:shadow-large glow-purple touch-manipulation"
                  style={{
                    boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
                  }}
                >
                  Fazer Upgrade para Plano Acompanhado
                </button>
              ) : (
                <button
                  onClick={() => {
                    const sessionId = localStorage.getItem('sessionId')
                    if (!sessionId) {
                      router.push('/criar-conta?plano=1')
                    } else {
                      handleSelecionarPlano(1)
                    }
                  }}
                  className="w-full py-4 sm:py-5 px-4 sm:px-6 bg-dark-card border-2 border-lilac/40 hover:border-lilac/60 text-white rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 touch-manipulation"
                  style={{
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Assinar Plano Inteligente
                </button>
              )}
            </div>

            {/* PLANO 2 - Acompanhado (Premium) */}
            <div className={`bg-gradient-to-br from-dark-secondary to-dark-tertiary border-2 rounded-2xl p-6 sm:p-8 lg:p-10 relative transition-all duration-300 lg:scale-105 ${
              planoAtual === 2 
                ? 'border-neon-pink/60 shadow-neon-pink' 
                : 'border-neon-pink/40 hover:border-neon-pink/60'
            }`}
              style={{
                boxShadow: planoAtual === 2 
                  ? '0 12px 48px rgba(255, 107, 157, 0.4)' 
                  : '0 8px 32px rgba(255, 107, 157, 0.2)'
              }}
            >
              {/* Badge Premium */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-neon-pink to-lilac rounded-full shadow-neon-pink glow-pink">
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    ⭐ Premium
                  </span>
                </div>
              </div>

              <div className="mb-6 lg:mb-8 mt-3 sm:mt-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  Plano Acompanhado
                </h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neon-pink">R$ 157</span>
                  <span className="text-lg sm:text-xl text-text-secondary">/mês</span>
                </div>
                {planoAtual === 2 && (
                  <div className="inline-block px-4 py-2 bg-neon-pink/20 border border-neon-pink/40 rounded-lg mb-4">
                    <span className="text-sm font-semibold text-neon-pink">Seu plano atual</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-primary leading-relaxed font-medium">
                    <strong>Tudo do Plano Inteligente +</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Acompanhamento direto com a nutricionista
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Ajustes manuais no plano alimentar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Atendimento via WhatsApp
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Área de acompanhamento e evolução individual
                  </span>
                </li>
              </ul>

              <button
                onClick={() => {
                  if (planoAtual === 2) return
                  const sessionId = localStorage.getItem('sessionId')
                  if (!sessionId) {
                    router.push('/criar-conta?plano=2')
                  } else {
                    handleSelecionarPlano(2)
                  }
                }}
                disabled={planoAtual === 2}
                className="w-full py-4 sm:py-5 px-4 sm:px-6 bg-gradient-to-r from-neon-pink to-lilac hover:from-lilac hover:to-neon-pink text-white rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 shadow-neon-pink hover:shadow-large glow-pink disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{
                  boxShadow: '0 6px 24px rgba(255, 107, 157, 0.4)'
                }}
              >
                {planoAtual === 2 ? 'Plano Ativo' : 'Assinar Plano Acompanhado'}
              </button>
            </div>
          </div>

          {/* Botão Voltar */}
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base font-semibold text-text-secondary hover:border-lilac/60 hover:text-lilac transition-all duration-300 touch-manipulation"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              ← Voltar à Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
