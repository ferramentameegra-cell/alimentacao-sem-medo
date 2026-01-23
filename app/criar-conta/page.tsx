'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import IntestineBackground from '@/components/IntestineBackground'

export default function CriarContaPage() {
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
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex items-center justify-center">
      <IntestineBackground />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Criar conta
          </h1>
          <p className="text-xl text-text-secondary">
            Comece sua jornada de alimentação sem medo
          </p>
        </div>

        <div className="bg-dark-secondary/95 backdrop-blur-sm border border-dark-border rounded-xl p-12 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.95) 0%, rgba(14, 11, 20, 0.95) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <form onSubmit={handleCriarConta} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-text-primary mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
                placeholder="seu@email.com"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-base font-semibold text-text-primary mb-3">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-5 py-4 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
                placeholder="Mínimo 6 caracteres"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-base font-semibold text-text-primary mb-3">
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="w-full px-5 py-4 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
                placeholder="Digite a senha novamente"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              />
            </div>

            {erro && (
              <div className="p-4 bg-dark-card border-2 border-neon-pink/30 rounded-xl">
                <p className="text-base text-neon-pink font-medium">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 px-6 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-lg font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
              }}
            >
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="text-base text-neon-cyan hover:text-lilac font-medium transition-colors block w-full"
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
