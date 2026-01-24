'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import IntestineBackground from '@/components/IntestineBackground'

function CriarContaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(null)

  useEffect(() => {
    // Verificar se há parâmetro de plano na URL
    const plano = searchParams.get('plano')
    if (plano) {
      setPlanoSelecionado(parseInt(plano))
    }
  }, [searchParams])

  const handleCriarConta = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setCarregando(true)

    try {
      const response = await fetch('/api/auth/criar-conta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('userEmail', email)
        
        // Se veio de um plano, selecionar o plano e redirecionar
        if (planoSelecionado) {
          try {
            const planoResponse = await fetch('/api/planos/selecionar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': data.sessionId,
              },
              body: JSON.stringify({ plano: planoSelecionado }),
            })
            
            if (planoResponse.ok) {
              // Verificar se há dados de cardápio pendente
              const dadosPendentes = localStorage.getItem('dadosCardapioPendente')
              if (dadosPendentes) {
                router.push('/montar-cardapio')
              } else {
                router.push('/')
              }
            } else {
              router.push('/')
            }
          } catch (error) {
            router.push('/')
          }
        } else {
          router.push('/')
        }
      } else {
        const error = await response.json()
        setErro(error.error || 'Erro ao criar conta')
      }
    } catch (error) {
      setErro('Erro ao criar conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at top center, rgba(110, 143, 61, 0.15), transparent 60%), linear-gradient(160deg, #0F2E2B 0%, #0C2623 40%, #081C1A 100%)'
      }}
    >
      <IntestineBackground />
      
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.05)' }}>
            Criar conta
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary/90">
            Comece sua jornada de alimentação sem medo
          </p>
        </div>

        <div
          className="backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-12"
          style={{
            background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
            border: '1px solid rgba(110, 143, 61, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}
        >
          <form onSubmit={handleCriarConta} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-text-primary mb-3">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-bg-secondary/80 border border-accent-secondary/30 rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                placeholder="seu@email.com"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)' }}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-base font-semibold text-text-primary mb-3">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-5 py-4 bg-bg-secondary/80 border border-accent-secondary/30 rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                placeholder="Mínimo 6 caracteres"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)' }}
              />
            </div>
            <div>
              <label htmlFor="confirmarSenha" className="block text-base font-semibold text-text-primary mb-3">Confirmar senha</label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="w-full px-5 py-4 bg-bg-secondary/80 border border-accent-secondary/30 rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                placeholder="Digite a senha novamente"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)' }}
              />
            </div>

            {erro && (
              <div
                className="p-4 rounded-xl border"
                style={{
                  background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
                  borderColor: 'rgba(110, 143, 61, 0.4)'
                }}
              >
                <p className="text-base text-accent-primary font-medium">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                color: '#E9EFEA',
                boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)'
              }}
            >
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="text-base text-accent-primary hover:text-accent-primary/80 font-medium transition-colors block w-full"
            >
              Já tem uma conta? Entrar
            </button>
            {planoSelecionado && (
              <p className="text-sm text-text-secondary">
                Você será redirecionado para selecionar seu plano após criar a conta
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CriarContaPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at top center, rgba(110, 143, 61, 0.15), transparent 60%), linear-gradient(160deg, #0F2E2B 0%, #0C2623 40%, #081C1A 100%)'
        }}
      >
        <IntestineBackground />
        <div className="relative z-10 text-center">
          <div className="text-xl text-accent-primary mb-4 font-semibold">Carregando...</div>
          <div className="flex justify-center gap-3">
            <div className="w-3 h-3 bg-accent-primary rounded-full animate-bounce" style={{ boxShadow: '0 0 12px rgba(110, 143, 61, 0.4)' }} />
            <div className="w-3 h-3 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s', boxShadow: '0 0 12px rgba(79, 107, 88, 0.4)' }} />
            <div className="w-3 h-3 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s', boxShadow: '0 0 12px rgba(110, 143, 61, 0.4)' }} />
          </div>
        </div>
      </div>
    }>
      <CriarContaForm />
    </Suspense>
  )
}
