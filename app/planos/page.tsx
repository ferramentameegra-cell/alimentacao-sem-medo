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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at top center, rgba(110, 143, 61, 0.15), transparent 60%), linear-gradient(160deg, #0F2E2B 0%, #0C2623 40%, #081C1A 100%)'
      }}
    >
      <IntestineBackground />
      
      <div className="relative z-10 min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight text-text-primary" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
              Escolha seu Plano
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary/90 font-light">
              Acesso completo à plataforma de alimentação sem medo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div
              className={`rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 card-hover ${
                planoAtual === 1 ? 'scale-[1.02]' : ''
              }`}
              style={{
                background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
                border: `1px solid ${planoAtual === 1 ? 'rgba(110, 143, 61, 0.4)' : 'rgba(110, 143, 61, 0.25)'}`,
                boxShadow: planoAtual === 1
                  ? '0 0 0 1px rgba(110, 143, 61, 0.4), 0 0 25px rgba(110, 143, 61, 0.25), 0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                  : '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              }}
            >
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  Plano Inteligente
                </h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-accent-primary">R$ 67</span>
                  <span className="text-lg sm:text-xl text-text-secondary">/mês</span>
                </div>
                {planoAtual === 1 && (
                  <div className="inline-block px-4 py-2 bg-accent-primary/20 border border-accent-primary/40 rounded-lg mb-4">
                    <span className="text-sm font-semibold text-accent-primary">Seu plano atual</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Geração automática de cardápios semanais personalizados
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Perfil evolutivo do paciente (histórico, preferências, restrições e progresso)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Ajustes automáticos do cardápio conforme evolução
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
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
                  className="w-full py-4 sm:py-5 px-4 sm:px-6 rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)]"
                  style={{
                    background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                    color: '#E9EFEA',
                    boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)'
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
                  className="w-full py-4 sm:py-5 px-4 sm:px-6 rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)]"
                  style={{
                    background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                    color: '#E9EFEA',
                    border: '1px solid rgba(110, 143, 61, 0.4)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                  }}
                >
                  Assinar Plano Inteligente
                </button>
              )}
            </div>

            {/* PLANO 2 - Acompanhado (Premium) */}
            <div
              className={`rounded-2xl p-6 sm:p-8 lg:p-10 relative transition-all duration-300 card-hover lg:scale-[1.02] ${planoAtual === 2 ? 'scale-[1.02]' : ''}`}
              style={{
                background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
                border: `1px solid ${planoAtual === 2 ? 'rgba(110, 143, 61, 0.4)' : 'rgba(110, 143, 61, 0.25)'}`,
                boxShadow: planoAtual === 2
                  ? '0 0 0 1px rgba(110, 143, 61, 0.4), 0 0 25px rgba(110, 143, 61, 0.25), 0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                  : '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              }}
            >
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div
                  className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                    boxShadow: '0 4px 16px rgba(110, 143, 61, 0.4)'
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">⭐ Premium</span>
                </div>
              </div>

              <div className="mb-6 lg:mb-8 mt-3 sm:mt-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">Plano Acompanhado</h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-accent-primary">R$ 157</span>
                  <span className="text-lg sm:text-xl text-text-secondary/90">/mês</span>
                </div>
                {planoAtual === 2 && (
                  <div className="inline-block px-4 py-2 rounded-lg mb-4" style={{ background: 'rgba(110, 143, 61, 0.2)', border: '1px solid rgba(110, 143, 61, 0.4)' }}>
                    <span className="text-sm font-semibold text-accent-primary">Seu plano atual</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-primary leading-relaxed font-medium"><strong>Tudo do Plano Inteligente +</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary/90 leading-relaxed">Acompanhamento direto com a nutricionista</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary/90 leading-relaxed">Ajustes manuais no plano alimentar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary/90 leading-relaxed">Atendimento via WhatsApp</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-accent-primary">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary/90 leading-relaxed">Área de acompanhamento e evolução individual</span>
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
                className="w-full py-4 sm:py-5 px-4 sm:px-6 rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)] disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                  color: '#E9EFEA',
                  boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)'
                }}
              >
                {planoAtual === 2 ? 'Plano Ativo' : 'Assinar Plano Acompanhado'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold text-text-secondary/90 hover:text-accent-primary transition-all duration-300 touch-manipulation"
              style={{
                background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
                border: '1px solid rgba(110, 143, 61, 0.25)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
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
