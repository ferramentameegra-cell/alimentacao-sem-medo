'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import IntestineBackground from '@/components/IntestineBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.sessionId) {
        // Salvar sessionId e email no localStorage de forma persistente
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('userEmail', email)
        
        // Verificar se a sessão foi salva corretamente
        const sessionSalva = localStorage.getItem('sessionId')
        const emailSalvo = localStorage.getItem('userEmail')
        
        if (sessionSalva && emailSalvo) {
          console.log('✅ Login realizado com sucesso. SessionId:', sessionSalva)
          
          // Aguardar um momento para garantir que tudo foi processado
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Verificar novamente antes de redirecionar
          const verificacao = await fetch('/api/auth/session', {
            headers: {
              'X-Session-Id': sessionSalva,
              'X-User-Email': emailSalvo,
            },
          })
          
          if (verificacao.ok) {
            // Sessão confirmada, redirecionar
            window.location.href = '/'
          } else {
            // Se verificação falhou, tentar novamente
            console.warn('⚠️ Verificação de sessão falhou, tentando novamente...')
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.href = '/'
          }
        } else {
          setErro('Erro ao salvar sessão. Tente novamente.')
          setCarregando(false)
        }
      } else {
        setErro(data.error || 'Email ou senha incorretos')
        setCarregando(false)
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setErro('Erro ao fazer login. Tente novamente.')
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex items-center justify-center">
      <IntestineBackground />
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-normal mb-4"
            style={{ 
              color: '#FFFFFF',
              fontFamily: 'var(--font-roketto)',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: '1.2'
            }}
          >
            Alimentação Sem Medo
          </h1>
          <p className="text-xl text-text-secondary">
            Seu espaço seguro para comer sem medo
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-dark-secondary/95 backdrop-blur-sm border border-dark-border rounded-xl p-12 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.95) 0%, rgba(14, 11, 20, 0.95) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="••••••••"
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
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/criar-conta')}
              className="text-base text-neon-cyan hover:text-lilac font-medium transition-colors"
            >
              Criar conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
